const SKILL_TAXONOMY = {
  frontend: ['React','Vue','Angular','JavaScript','TypeScript','HTML','CSS','SASS','Redux','Next.js','Nuxt','Webpack','Tailwind','Bootstrap','jQuery','GraphQL','Apollo'],
  backend: ['Node.js','Express','Django','Flask','FastAPI','Spring Boot','Ruby on Rails','Laravel','REST API','GraphQL','Microservices','JWT','OAuth'],
  database: ['MongoDB','PostgreSQL','MySQL','Redis','Cassandra','SQLite','DynamoDB','Elasticsearch','Firebase','Supabase'],
  cloud: ['AWS','Azure','GCP','Heroku','Vercel','Netlify','DigitalOcean','Cloudflare','S3','EC2','Lambda'],
  devops: ['Docker','Kubernetes','Jenkins','GitHub Actions','GitLab CI','Terraform','Ansible','Nginx','Linux','Bash','CI/CD','Helm','Prometheus','Grafana'],
  ml: ['Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy','NLP','Computer Vision','BERT','Transformer','XGBoost','LightGBM','Keras','OpenCV','Jupyter'],
  mobile: ['React Native','Flutter','Android','iOS','Swift','Kotlin','Dart','Expo','Jetpack Compose','SwiftUI'],
  languages: ['Python','Java','C++','C#','Go','Rust','Ruby','PHP','Scala','R','Kotlin','Swift','TypeScript','JavaScript'],
  tools: ['Git','Jira','Confluence','Postman','VS Code','Figma','Slack','Notion','Linux','Bash','Maven','Gradle'],
  soft: ['Agile','Scrum','Leadership','Communication','Problem Solving','Team Player','Mentoring','Code Review'],
};

function extractSkills(text) {
  const lower = text.toLowerCase();
  const categories = {};
  const allSkills = [];

  for (const [cat, skills] of Object.entries(SKILL_TAXONOMY)) {
    categories[cat] = skills.filter(s => lower.includes(s.toLowerCase()));
    allSkills.push(...categories[cat]);
  }

  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  const expYears = expMatch ? parseInt(expMatch[1]) : 0;
  const experienceLevel = expYears >= 7 ? 'Senior' : expYears >= 3 ? 'Mid-Level' : 'Junior';

  return { categories, allSkills: [...new Set(allSkills)], experienceLevel };
}

module.exports = { extractSkills };
