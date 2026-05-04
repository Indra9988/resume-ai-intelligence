"""
predict.py
Load trained model artifacts and predict job role from a resume text.

Usage:
  python predict.py "Python TensorFlow Pandas machine learning model deployment..."
  python predict.py --file path/to/resume.txt
"""

import sys
import os
import json
import re
import joblib
import argparse
import numpy as np

MODEL_DIR = "../models"

STOPWORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs",
    "themselves", "what", "which", "who", "whom", "this", "that", "these",
    "those", "am", "is", "are", "was", "were", "be", "been", "being", "have",
    "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the",
    "and", "but", "if", "or", "because", "as", "until", "while", "of", "at",
    "by", "for", "with", "through", "during", "to", "from", "in", "out",
    "on", "off", "over", "then", "once", "here", "there", "when", "where",
    "so", "than", "too", "very", "can", "will", "just", "should", "now"
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


def load_model():
    required = ["tfidf_vectorizer.pkl", "best_model.pkl", "label_encoder.pkl", "model_metadata.json"]
    for f in required:
        path = os.path.join(MODEL_DIR, f)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model artifact not found: {path}\nRun train_models.py first.")

    vectorizer = joblib.load(f"{MODEL_DIR}/tfidf_vectorizer.pkl")
    model = joblib.load(f"{MODEL_DIR}/best_model.pkl")
    le = joblib.load(f"{MODEL_DIR}/label_encoder.pkl")
    with open(f"{MODEL_DIR}/model_metadata.json") as f:
        meta = json.load(f)

    return vectorizer, model, le, meta


def predict(text, vectorizer, model, le, top_n=3):
    """Return top N predicted roles with confidence scores."""
    processed = preprocess_text(text)
    vec = vectorizer.transform([processed])

    # Get probabilities if available, else use decision function
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(vec)[0]
        top_indices = np.argsort(probs)[::-1][:top_n]
        top_roles = [(le.classes_[i], round(float(probs[i]) * 100, 2)) for i in top_indices]
    elif hasattr(model, "decision_function"):
        scores = model.decision_function(vec)[0]
        # Normalize to 0-100 range
        scores = scores - scores.min()
        total = scores.sum()
        if total > 0:
            probs = scores / total
        else:
            probs = np.ones(len(scores)) / len(scores)
        top_indices = np.argsort(probs)[::-1][:top_n]
        top_roles = [(le.classes_[i], round(float(probs[i]) * 100, 2)) for i in top_indices]
    else:
        pred = model.predict(vec)[0]
        top_roles = [(le.classes_[pred], 100.0)]

    predicted_label = top_roles[0][0]
    confidence = top_roles[0][1]
    return predicted_label, confidence, top_roles


def main():
    parser = argparse.ArgumentParser(description="Predict job role from resume text")
    parser.add_argument("text", nargs="?", help="Resume text as a string")
    parser.add_argument("--file", "-f", help="Path to a .txt file containing resume text")
    parser.add_argument("--top", "-n", type=int, default=3, help="Number of top predictions (default: 3)")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        print("Reading from stdin (paste resume text, then Ctrl+D):")
        text = sys.stdin.read()

    if not text.strip():
        print("❌ No text provided.")
        sys.exit(1)

    print("\n🤖 Loading model...")
    vectorizer, model, le, meta = load_model()
    print(f"   Model: {meta['best_model']}")
    print(f"   Classes: {meta['num_classes']}")

    print("\n🔍 Predicting...")
    label, confidence, top_roles = predict(text, vectorizer, model, le, top_n=args.top)

    print("\n" + "=" * 50)
    print(f"  🏆 Predicted Role : {label}")
    print(f"  📊 Confidence     : {confidence:.1f}%")
    print("=" * 50)
    print(f"\n  Top {args.top} Predictions:")
    for rank, (role, score) in enumerate(top_roles, 1):
        bar = "█" * int(score / 5) + "░" * (20 - int(score / 5))
        print(f"  {rank}. {role:<28} {bar} {score:.1f}%")
    print()


if __name__ == "__main__":
    main()
