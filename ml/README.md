# ML Model Training Guide

## Overview

This module trains a **resume job-role classifier** using 5 ML algorithms
on 240 synthetic labeled resumes across 8 job categories.

| Role | Count |
|---|---|
| Frontend Developer | 30 |
| Backend Developer | 30 |
| Data Scientist | 30 |
| DevOps Engineer | 30 |
| Full Stack Developer | 30 |
| Mobile Developer | 30 |
| Data Engineer | 30 |
| Cybersecurity Analyst | 30 |

---

## Setup

```bash
cd ml
pip install -r requirements.txt
```

---

## Step 1 — Generate Dataset

```bash
cd scripts
python generate_dataset.py
```

Creates `ml/data/resumes_dataset.csv` with 240 labeled resumes.
Edit `generate_dataset.py` → `samples_per_role=50` to get 400 samples.

---

## Step 2 — Train Models

```bash
python train_models.py
```

Trains and compares 5 classifiers:

| Model | Notes |
|---|---|
| Logistic Regression | Fast, usually best for TF-IDF text |
| Linear SVM | Very strong for high-dimensional text |
| Random Forest | Good baseline, slower |
| Naive Bayes | Blazing fast, decent accuracy |
| Gradient Boosting | Most accurate but slowest |

Saves the best model to `ml/models/`:
- `best_model.pkl` — trained classifier
- `tfidf_vectorizer.pkl` — fitted TF-IDF vectorizer
- `label_encoder.pkl` — role label encoder
- `model_metadata.json` — accuracy metrics + class list

---

## Step 3 — Test Prediction

```bash
# From a string
python predict.py "Python TensorFlow Keras deep learning NLP model deployment"

# From a file
python predict.py --file my_resume.txt

# Show top 5 predictions
python predict.py --top 5 "Docker Kubernetes AWS CI/CD Jenkins Terraform Linux"
```

---

## Step 4 — Start ML API Server

```bash
python ml_api.py
# Runs on http://localhost:5001
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/model-info` | Model metadata |
| POST | `/predict` | Predict single resume |
| POST | `/predict-batch` | Predict multiple resumes |

### Example Request

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "React TypeScript Redux Next.js Tailwind CSS component library", "top_n": 3}'
```

### Example Response

```json
{
  "success": true,
  "predicted_role": "Frontend Developer",
  "confidence": 82.3,
  "top_predictions": [
    {"role": "Frontend Developer", "confidence": 82.3},
    {"role": "Full Stack Developer", "confidence": 10.1},
    {"role": "Mobile Developer", "confidence": 4.2}
  ],
  "model_used": "Logistic Regression"
}
```

---

## Architecture

```
Resume Text
    │
    ▼
TF-IDF Vectorizer (1,835 features, bigrams)
    │
    ▼
Logistic Regression Classifier
    │
    ▼
Role Probabilities → Top-N Predictions
```

## Node.js Integration

The backend's `utils/mlService.js` automatically calls the Python ML API:

```javascript
const { predictRole } = require('./utils/mlService');
const result = await predictRole(resumeText);
// result.predictedRole → "Data Scientist"
// result.confidence   → 87.4
// result.topPredictions → [{role, confidence}, ...]
```

If the Python API is offline, it **automatically falls back** to the
built-in keyword-based classifier — so the backend always works.

---

## Improve Accuracy

- Add more training samples: set `samples_per_role=100+`
- Add your own real resumes to `resumes_dataset.csv`
- Enable `flask-cors` for production deployments
- Try `model = LinearSVC()` or `RandomForest` for variety
