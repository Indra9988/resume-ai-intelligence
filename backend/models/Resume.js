const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    candidateName: { type: String, default: 'Unknown' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    rawText: { type: String, required: true },
    fileName: { type: String, default: 'pasted-text' },
    fileType: { type: String, default: 'text' },

    // Extracted skills
    skills: { type: [String], default: [] },
    skillCategories: {
      frontend:  { type: [String], default: [] },
      backend:   { type: [String], default: [] },
      database:  { type: [String], default: [] },
      cloud:     { type: [String], default: [] },
      devops:    { type: [String], default: [] },
      ml:        { type: [String], default: [] },
      mobile:    { type: [String], default: [] },
      languages: { type: [String], default: [] },
      tools:     { type: [String], default: [] },
      soft:      { type: [String], default: [] },
    },

    // ATS Scoring
    atsScore: {
      overall: { type: Number, default: 0 },
      breakdown: {
        skillsScore:      { type: Number, default: 0 },
        experienceScore:  { type: Number, default: 0 },
        educationScore:   { type: Number, default: 0 },
        formattingScore:  { type: Number, default: 0 },
        keywordScore:     { type: Number, default: 0 },
        completenessScore:{ type: Number, default: 0 },
      },
      strengths:                { type: [String], default: [] },
      improvements:             { type: [String], default: [] },
      shortlistRecommendation:  { type: String, default: 'REVIEW' },
    },

    // ML Prediction from Python model
    mlPrediction: {
      source:         { type: String, default: 'rule_based_fallback' },
      predictedRole:  { type: String, default: '' },
      confidence:     { type: Number, default: 0 },
      modelUsed:      { type: String, default: '' },
      topPredictions: [
        {
          role:       { type: String },
          confidence: { type: Number },
        },
      ],
    },

    // Aggregated role / experience info
    predictedRoles:  { type: [String], default: [] },
    experienceLevel: { type: String, default: 'Unknown' },
    aiAnalysis:      { type: String, default: '' },

    // Job match results (stored after matching)
    jobMatches: [
      {
        jobTitle:      { type: String },
        matchScore:    { type: Number },
        matchedSkills: { type: [String] },
        missingSkills: { type: [String] },
        verdict:       { type: String },
        matchedAt:     { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for fast queries
ResumeSchema.index({ 'atsScore.overall': -1 });
ResumeSchema.index({ 'predictedRoles': 1 });
ResumeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
