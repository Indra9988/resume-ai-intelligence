function calculateATSScore(text, skillData) {
  const lower = text.toLowerCase();
  const skills = skillData?.allSkills || [];

  const skillsScore     = Math.min(100, skills.length * 5);
  const experienceScore = /(\d+)\+?\s*years/i.test(text) ? 80 : lower.includes('experience') ? 50 : 20;
  const educationScore  = /b\.?tech|m\.?tech|b\.?e|m\.?sc|bachelor|master|phd/i.test(text) ? 90 : lower.includes('degree') ? 60 : 30;
  const formattingScore = [/summary|objective/i, /experience|work history/i, /education/i, /skills/i, /certif/i].filter(r => r.test(text)).length * 20;
  const keywordScore    = Math.min(100, skills.length * 4);
  const completenessScore = [/@/, /\+?\d{10}/, /linkedin/, /github/].filter(r => r.test(text)).length * 25;

  const overall = Math.round((skillsScore * 0.25 + experienceScore * 0.20 + educationScore * 0.15 + formattingScore * 0.15 + keywordScore * 0.15 + completenessScore * 0.10));

  const strengths = [];
  const improvements = [];
  if (skillsScore >= 60) strengths.push('Strong technical skill set'); else improvements.push('Add more relevant technical skills');
  if (experienceScore >= 70) strengths.push('Good experience documentation'); else improvements.push('Quantify experience with years and achievements');
  if (educationScore >= 70) strengths.push('Education credentials present'); else improvements.push('Add your educational qualifications');
  if (completenessScore >= 50) strengths.push('Contact info complete'); else improvements.push('Add email, phone, and LinkedIn URL');

  const shortlistRecommendation = overall >= 70 ? 'SHORTLIST' : overall >= 50 ? 'REVIEW' : 'REJECT';

  return { overall, breakdown: { skillsScore, experienceScore, educationScore, formattingScore, keywordScore, completenessScore }, strengths, improvements, shortlistRecommendation };
}

module.exports = { calculateATSScore };
