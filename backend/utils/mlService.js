/**
 * mlService.js
 * Node.js client that calls the Python ML API for resume role prediction.
 * Falls back to rule-based classification if Python API is unavailable.
 */

const http = require('http');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001';
const ML_TIMEOUT_MS = 5000;

// ── Rule-based fallback classifier ──────────────────────────────────────────
const ROLE_KEYWORDS = {
  'Data Scientist': [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'nlp', 'computer vision', 'neural network', 'data science', 'model training',
    'feature engineering', 'xgboost', 'lightgbm', 'bert', 'transformer', 'kaggle',
    'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'statistics',
  ],
  'Frontend Developer': [
    'react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript',
    'redux', 'webpack', 'ui', 'ux', 'responsive design', 'sass', 'tailwind',
    'next.js', 'nuxt', 'storybook', 'jest', 'cypress', 'figma',
  ],
  'Backend Developer': [
    'node.js', 'express', 'django', 'flask', 'fastapi', 'spring boot',
    'rest api', 'graphql', 'microservices', 'postgresql', 'mysql', 'mongodb',
    'redis', 'message queue', 'kafka', 'rabbitmq', 'jwt', 'oauth',
  ],
  'DevOps Engineer': [
    'docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions', 'terraform',
    'ansible', 'aws', 'azure', 'gcp', 'linux', 'bash', 'helm', 'prometheus',
    'grafana', 'nginx', 'load balancer', 'iac', 'cloud', 'sre',
  ],
  'Full Stack Developer': [
    'full stack', 'mern', 'mean', 'react', 'node', 'frontend', 'backend',
    'end-to-end', 'full-stack', 'web application',
  ],
  'Mobile Developer': [
    'react native', 'flutter', 'android', 'ios', 'swift', 'kotlin',
    'mobile app', 'play store', 'app store', 'expo', 'dart', 'xcode',
    'jetpack', 'coroutines', 'swiftui',
  ],
  'Data Engineer': [
    'apache spark', 'hadoop', 'airflow', 'kafka', 'etl', 'data pipeline',
    'data warehouse', 'snowflake', 'redshift', 'bigquery', 'dbt',
    'data lake', 's3', 'hdfs', 'hive', 'flink', 'databricks',
  ],
  'Cybersecurity Analyst': [
    'penetration testing', 'security', 'kali linux', 'metasploit', 'burp suite',
    'vulnerability', 'owasp', 'siem', 'splunk', 'incident response',
    'threat intelligence', 'firewall', 'ids', 'ips', 'soc', 'ethical hacking',
  ],
};

function fallbackClassify(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    scores[role] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;

  return sorted.slice(0, 3).map(([role, score]) => ({
    role,
    confidence: Math.round((score / total) * 100 * 10) / 10,
  }));
}

// ── HTTP helper ──────────────────────────────────────────────────────────────
function httpPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          reject(new Error('Invalid JSON response from ML API'));
        }
      });
    });

    req.setTimeout(ML_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('ML API timeout'));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Main exported functions ──────────────────────────────────────────────────

/**
 * Predict job role from resume text.
 * Tries the Python ML API first; falls back to rule-based classifier.
 */
async function predictRole(resumeText, topN = 3) {
  try {
    const result = await httpPost(`${ML_API_URL}/predict`, {
      text: resumeText,
      top_n: topN,
    });

    if (result.success) {
      return {
        source: 'ml_model',
        predictedRole: result.predicted_role,
        confidence: result.confidence,
        topPredictions: result.top_predictions,
        modelUsed: result.model_used,
      };
    }
    throw new Error(result.error || 'ML API returned failure');
  } catch (err) {
    // Fallback to rule-based
    console.warn(`[mlService] ML API unavailable (${err.message}), using fallback`);
    const predictions = fallbackClassify(resumeText);
    return {
      source: 'rule_based_fallback',
      predictedRole: predictions[0]?.role || 'Unknown',
      confidence: predictions[0]?.confidence || 0,
      topPredictions: predictions,
      modelUsed: 'keyword_scorer',
    };
  }
}

/**
 * Predict roles for multiple resumes (batch).
 */
async function predictBatch(resumes) {
  // resumes: [{id, text}, ...]
  try {
    const result = await httpPost(`${ML_API_URL}/predict-batch`, { resumes });
    if (result.success) return result.results;
    throw new Error(result.error);
  } catch (err) {
    console.warn(`[mlService] Batch ML API failed (${err.message}), using fallback`);
    return resumes.map((r) => {
      const predictions = fallbackClassify(r.text || '');
      return {
        id: r.id,
        predictedRole: predictions[0]?.role || 'Unknown',
        confidence: predictions[0]?.confidence || 0,
        topPredictions: predictions,
      };
    });
  }
}

/**
 * Check if the Python ML API is reachable.
 */
async function checkMLHealth() {
  try {
    const info = await httpPost(`${ML_API_URL}/health`, {});
    return { available: true, ...info };
  } catch {
    return { available: false };
  }
}

module.exports = { predictRole, predictBatch, checkMLHealth };

