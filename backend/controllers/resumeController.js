/**
 * resumeController.js
 * Handles resume upload, parsing, ATS scoring, and ML-powered role prediction.
 */

const path = require('path');
const fs = require('fs');
const { parseResume } = require('../utils/resumeParser');
const { extractSkills, classifyRole } = require('../utils/skillExtractor');
const { calculateATSScore } = require('../utils/atsScorer');
const { predictRole, checkMLHealth } = require('../utils/mlService');
const Resume = require('../models/Resume');

// ── Upload & analyze resume ──────────────────────────────────────────────────
const uploadResume = async (req, res) => {
  try {
    let rawText = '';
    let fileName = 'pasted-text';
    let fileType = 'text';

    if (req.file) {
      // File upload (PDF / DOCX)
      fileName = req.file.originalname;
      fileType = path.extname(fileName).replace('.', '').toLowerCase();
      rawText = await parseResume(req.file.path);

      // Clean up temp file
      fs.unlink(req.file.path, () => {});
    } else if (req.body.resumeText) {
      rawText = req.body.resumeText;
    } else {
      return res.status(400).json({ success: false, error: 'No resume data provided' });
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Resume text too short or could not be parsed' });
    }

    // ── Extract structured data ──────────────────────────────────────────────
    const skillData = extractSkills(rawText);
    const atsResult = calculateATSScore(rawText, skillData);

    // ── ML Role Prediction ───────────────────────────────────────────────────
    const mlResult = await predictRole(rawText, 3);

    // ── Build candidate name from text (simple heuristic) ───────────────────
    const firstLine = rawText.split('\n').find(l => l.trim().length > 2 && l.trim().length < 60);
    const candidateName = firstLine?.trim() || 'Unknown Candidate';

    // ── Email / phone regex ──────────────────────────────────────────────────
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = rawText.match(/(\+?\d[\d\s\-().]{8,}\d)/);

    // ── Persist to MongoDB ───────────────────────────────────────────────────
    const resumeDoc = new Resume({
      candidateName,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim() || '',
      rawText,
      fileName,
      fileType,
      skills: skillData.allSkills,
      skillCategories: skillData.categories,
      atsScore: {
        overall: atsResult.overall,
        breakdown: atsResult.breakdown,
        strengths: atsResult.strengths,
        improvements: atsResult.improvements,
        shortlistRecommendation: atsResult.shortlistRecommendation,
      },
      predictedRoles: mlResult.topPredictions.map(p => p.role),
      experienceLevel: skillData.experienceLevel || 'Mid-Level',
      mlPrediction: mlResult,
    });

    await resumeDoc.save();

    return res.status(201).json({
      success: true,
      message: 'Resume analyzed and saved',
      resumeId: resumeDoc._id,
      data: {
        candidateName,
        email: resumeDoc.email,
        phone: resumeDoc.phone,
        skills: skillData.allSkills,
        skillCategories: skillData.categories,
        atsScore: resumeDoc.atsScore,
        mlPrediction: mlResult,
        predictedRoles: resumeDoc.predictedRoles,
        experienceLevel: resumeDoc.experienceLevel,
      },
    });
  } catch (err) {
    console.error('[resumeController] uploadResume error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Get all resumes from DB ──────────────────────────────────────────────────
const getAllResumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const minAts = parseInt(req.query.minAts) || 0;

    const filter = {};
    if (role) filter['predictedRoles.0'] = role;
    if (minAts > 0) filter['atsScore.overall'] = { $gte: minAts };

    const total = await Resume.countDocuments(filter);
    const resumes = await Resume.find(filter)
      .select('-rawText') // exclude heavy field from list
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      resumes,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Get single resume by ID ──────────────────────────────────────────────────
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });
    return res.json({ success: true, resume });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── Delete resume ────────────────────────────────────────────────────────────
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });
    return res.json({ success: true, message: 'Resume deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ── ML health check endpoint ─────────────────────────────────────────────────
const mlHealth = async (req, res) => {
  const health = await checkMLHealth();
  return res.json(health);
};

// ── Stats for dashboard ──────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const total = await Resume.countDocuments();
    const shortlisted = await Resume.countDocuments({ 'atsScore.shortlistRecommendation': 'SHORTLIST' });
    const avgAts = await Resume.aggregate([
      { $group: { _id: null, avg: { $avg: '$atsScore.overall' } } }
    ]);
    const byRole = await Resume.aggregate([
      { $group: { _id: { $arrayElemAt: ['$predictedRoles', 0] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalResumes: total,
        shortlisted,
        avgAtsScore: Math.round(avgAts[0]?.avg || 0),
        byRole: byRole.map(r => ({ role: r._id, count: r.count })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { uploadResume, getAllResumes, getResumeById, deleteResume, mlHealth, getStats };
