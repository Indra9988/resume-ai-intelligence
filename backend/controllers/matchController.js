const { computeSimilarity } = require('../utils/similarityEngine');
const { extractSkills } = require('../utils/skillExtractor');
const Resume = require('../models/Resume');

const matchResumeToJob = async (req, res) => {
  try {
    const { resumeText, resumeId, jobDescription, jobTitle = 'Job' } = req.body;

    let text = resumeText;
    if (!text && resumeId) {
      const doc = await Resume.findById(resumeId);
      if (!doc) return res.status(404).json({ success: false, error: 'Resume not found' });
      text = doc.rawText;
    }
    if (!text) return res.status(400).json({ success: false, error: 'resumeText or resumeId required' });
    if (!jobDescription) return res.status(400).json({ success: false, error: 'jobDescription required' });

    const similarity = computeSimilarity(text, jobDescription);
    const resumeSkills = extractSkills(text);
    const jdSkills = extractSkills(jobDescription);

    const matched = resumeSkills.allSkills.filter(s =>
      jdSkills.allSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
    );
    const missing = jdSkills.allSkills.filter(s =>
      !resumeSkills.allSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
    );

    const score = Math.round(similarity * 100);
    const verdict = score >= 70 ? 'STRONG MATCH' : score >= 50 ? 'MODERATE MATCH' : 'WEAK MATCH';

    // Persist match to resume doc if resumeId provided
    if (resumeId) {
      await Resume.findByIdAndUpdate(resumeId, {
        $push: {
          jobMatches: {
            jobTitle,
            matchScore: score,
            matchedSkills: matched,
            missingSkills: missing,
            verdict,
          },
        },
      });
    }

    return res.json({
      success: true,
      matchScore: score,
      verdict,
      matchedSkills: matched,
      missingSkills: missing,
      resumeSkillCount: resumeSkills.allSkills.length,
      jdSkillCount: jdSkills.allSkills.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const batchMatch = async (req, res) => {
  try {
    const { resumeIds, jobDescription, jobTitle = 'Job' } = req.body;
    if (!resumeIds || !jobDescription)
      return res.status(400).json({ success: false, error: 'resumeIds[] and jobDescription required' });

    const resumes = await Resume.find({ _id: { $in: resumeIds } });
    const jdSkills = extractSkills(jobDescription);

    const results = resumes.map(doc => {
      const sim = computeSimilarity(doc.rawText, jobDescription);
      const score = Math.round(sim * 100);
      const matched = doc.skills.filter(s =>
        jdSkills.allSkills.map(x => x.toLowerCase()).includes(s.toLowerCase())
      );
      const missing = jdSkills.allSkills.filter(s =>
        !doc.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())
      );
      return {
        resumeId: doc._id,
        candidateName: doc.candidateName,
        matchScore: score,
        verdict: score >= 70 ? 'STRONG MATCH' : score >= 50 ? 'MODERATE MATCH' : 'WEAK MATCH',
        matchedSkills: matched,
        missingSkills: missing,
        atsScore: doc.atsScore?.overall || 0,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ success: true, jobTitle, total: results.length, results });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { matchResumeToJob, batchMatch };
