"""
ml_api.py
Flask REST API that serves the trained resume classification model.
Integrates with the Node.js backend via HTTP.

Run: python ml_api.py
Endpoints:
  POST /predict        - predict role from resume text
  GET  /health         - health check
  GET  /model-info     - model metadata
"""

import os
import re
import json
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_DIR = "../models"

# ── Global model state ───────────────────────────────────────────────────────
vectorizer = None
model = None
le = None
meta = None

STOPWORDS = set([
    "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she",
    "her", "it", "its", "they", "them", "their", "what", "which", "who",
    "this", "that", "these", "those", "am", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "a", "an",
    "the", "and", "but", "if", "or", "of", "at", "by", "for", "with", "to",
    "from", "in", "out", "on", "so", "than", "too", "very", "can", "will",
    "just", "should", "now", "then", "here", "there", "when", "where"
])


def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'\+?\d[\d\s\-().]{8,}', ' ', text)
    text = re.sub(r'[^\w\s\+\#\.]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = [t for t in text.split() if t not in STOPWORDS and len(t) > 1]
    return ' '.join(tokens)


def load_artifacts():
    global vectorizer, model, le, meta
    required = ["tfidf_vectorizer.pkl", "best_model.pkl", "label_encoder.pkl", "model_metadata.json"]
    for f in required:
        path = os.path.join(MODEL_DIR, f)
        if not os.path.exists(path):
            print(f"⚠️  Model file not found: {path}")
            print("   Run: python train_models.py first")
            return False
    vectorizer = joblib.load(f"{MODEL_DIR}/tfidf_vectorizer.pkl")
    model = joblib.load(f"{MODEL_DIR}/best_model.pkl")
    le = joblib.load(f"{MODEL_DIR}/label_encoder.pkl")
    with open(f"{MODEL_DIR}/model_metadata.json") as f:
        meta = json.load(f)
    print(f"✅ Model loaded: {meta['best_model']} | Classes: {meta['num_classes']}")
    return True


def get_predictions(text, top_n=3):
    processed = preprocess_text(text)
    vec = vectorizer.transform([processed])

    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vec)[0]
        top_indices = np.argsort(probs)[::-1][:top_n]
        predictions = [
            {"role": le.classes_[i], "confidence": round(float(probs[i]) * 100, 2)}
            for i in top_indices
        ]
    elif hasattr(model, "decision_function"):
        scores = model.decision_function(vec)[0]
        scores = scores - scores.min()
        total = scores.sum()
        probs = (scores / total) if total > 0 else np.ones(len(scores)) / len(scores)
        top_indices = np.argsort(probs)[::-1][:top_n]
        predictions = [
            {"role": le.classes_[i], "confidence": round(float(probs[i]) * 100, 2)}
            for i in top_indices
        ]
    else:
        pred = model.predict(vec)[0]
        predictions = [{"role": le.classes_[pred], "confidence": 100.0}]

    return predictions


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_name": meta["best_model"] if meta else None,
    })


@app.route("/model-info", methods=["GET"])
def model_info():
    if not meta:
        return jsonify({"error": "Model not loaded"}), 503
    return jsonify(meta)


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Run train_models.py first."}), 503

    body = request.get_json()
    if not body or "text" not in body:
        return jsonify({"error": "Request body must have a 'text' field"}), 400

    text = body["text"]
    if not text.strip():
        return jsonify({"error": "Empty text provided"}), 400

    top_n = int(body.get("top_n", 3))
    top_n = max(1, min(top_n, meta["num_classes"]))

    try:
        predictions = get_predictions(text, top_n=top_n)
        return jsonify({
            "success": True,
            "predicted_role": predictions[0]["role"],
            "confidence": predictions[0]["confidence"],
            "top_predictions": predictions,
            "model_used": meta["best_model"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-batch", methods=["POST"])
def predict_batch():
    """Predict roles for multiple resumes at once."""
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    body = request.get_json()
    if not body or "resumes" not in body:
        return jsonify({"error": "Request body must have a 'resumes' array"}), 400

    resumes = body["resumes"]  # List of {id, text}
    results = []
    for item in resumes:
        rid = item.get("id", "unknown")
        text = item.get("text", "")
        if not text.strip():
            results.append({"id": rid, "error": "Empty text"})
            continue
        try:
            predictions = get_predictions(text, top_n=3)
            results.append({
                "id": rid,
                "predicted_role": predictions[0]["role"],
                "confidence": predictions[0]["confidence"],
                "top_predictions": predictions,
            })
        except Exception as e:
            results.append({"id": rid, "error": str(e)})

    return jsonify({"success": True, "results": results, "total": len(results)})


# ── Start ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting Resume ML API...")
    loaded = load_artifacts()
    if not loaded:
        print("⚠️  Starting without model — train first with: python train_models.py")

    port = int(os.environ.get("ML_API_PORT", 5001))
    print(f"   Listening on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
