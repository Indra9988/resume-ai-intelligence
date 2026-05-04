const express = require('express');
const router = express.Router();

// Sample job listings (replace with DB later)
const SAMPLE_JOBS = [
  {
    id: 'j1',
    title: 'Senior React Developer',
    company: 'Zoho Corporation',
    location: 'Chennai, TN',
    type: 'Full-time',
    description: 'We are looking for a Senior React Developer to join our frontend team.',
    requirements: 'React, TypeScript, Redux, REST API, Node.js, Git, Agile, 3+ years experience',
    skills: ['React', 'TypeScript', 'Redux', 'REST API', 'Node.js', 'Git'],
  },
  {
    id: 'j2',
    title: 'Data Scientist',
    company: 'Flipkart',
    location: 'Bangalore, KA',
    type: 'Full-time',
    description: 'Join our data science team to build ML models for recommendation and fraud detection.',
    requirements: 'Python, Machine Learning, TensorFlow, Pandas, SQL, Statistics, 2+ years',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL', 'Scikit-learn'],
  },
  {
    id: 'j3',
    title: 'DevOps Engineer',
    company: 'Infosys',
    location: 'Pune, MH',
    type: 'Full-time',
    description: 'Manage CI/CD pipelines and cloud infrastructure for enterprise clients.',
    requirements: 'Docker, Kubernetes, AWS, Jenkins, Terraform, Linux, 3+ years experience',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Linux'],
  },
  {
    id: 'j4',
    title: 'Full Stack Developer',
    company: 'Freshworks',
    location: 'Chennai, TN',
    type: 'Full-time',
    description: 'Build scalable SaaS products using modern full-stack technologies.',
    requirements: 'Node.js, React, MongoDB, REST API, Docker, AWS, 2+ years',
    skills: ['Node.js', 'React', 'MongoDB', 'REST API', 'Docker', 'AWS'],
  },
  {
    id: 'j5',
    title: 'Mobile Developer (Flutter)',
    company: 'PhonePe',
    location: 'Bangalore, KA',
    type: 'Full-time',
    description: 'Develop and maintain our cross-platform mobile payment application.',
    requirements: 'Flutter, Dart, Firebase, REST API, Android, iOS, Git, 2+ years',
    skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'Android', 'iOS'],
  },
  {
    id: 'j6',
    title: 'Data Engineer',
    company: 'TCS',
    location: 'Hyderabad, TS',
    type: 'Full-time',
    description: 'Design and build large-scale data pipelines for enterprise analytics.',
    requirements: 'Apache Spark, Python, SQL, Airflow, AWS S3, Kafka, ETL, 3+ years',
    skills: ['Apache Spark', 'Python', 'SQL', 'Airflow', 'Kafka', 'ETL'],
  },
];

router.get('/', (req, res) => {
  res.json({ success: true, jobs: SAMPLE_JOBS, total: SAMPLE_JOBS.length });
});

router.get('/:id', (req, res) => {
  const job = SAMPLE_JOBS.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
  res.json({ success: true, job });
});

module.exports = router;
