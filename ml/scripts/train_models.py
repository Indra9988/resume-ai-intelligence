"""
train_models.py
Trains multiple ML models for resume job-role classification.
Saves the best model + vectorizer to ../models/

Run: python train_models.py
"""

import os
import sys
import csv
import json
import time
import joblib
import numpy as np
import pandas as pd
from collections import Counter

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    f1_score, precision_score, recall_score
)

# Models to train and compare
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import MultinomialNB

import warnings
warnings.filterwarnings("ignore")

DATA_PATH = "../data/resumes_dataset.csv"
MODEL_DIR = "../models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Text preprocessing ──────────────────────────────────────────────────────
import re
import string

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
    """Clean and normalize resume text."""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' ', text)          # remove URLs
    text = re.sub(r'\S+@\S+', ' ', text)                 # remove emails
    text = re.sub(r'\+?\d[\d\s\-().]{8,}', ' ', text)   # remove phone numbers
    text = re.sub(r'[^\w\s\+\#\.]', ' ', text)           # keep useful chars
    text = re.sub(r'\s+', ' ', text).strip()

    tokens = text.split()
    tokens = [t for t in tokens if t not in STOPWORDS and len(t) > 1]
    return ' '.join(tokens)


# ── Load dataset ────────────────────────────────────────────────────────────
def load_data(path):
    print(f"📂 Loading dataset from {path}...")
    df = pd.read_csv(path)
    print(f"   Rows: {len(df)}")
    print(f"   Class distribution:")
    for label, count in Counter(df['label']).most_common():
        print(f"     {label}: {count}")
    return df


# ── Feature engineering ─────────────────────────────────────────────────────
def build_vectorizer():
    return TfidfVectorizer(
        preprocessor=preprocess_text,
        ngram_range=(1, 2),        # unigrams + bigrams
        max_features=8000,
        sublinear_tf=True,         # log normalization
        min_df=2,
        max_df=0.95,
        strip_accents='unicode',
        analyzer='word',
    )


# ── Model definitions ───────────────────────────────────────────────────────
MODELS = {
    "Logistic Regression": LogisticRegression(
        max_iter=1000, C=5.0, solver='lbfgs', random_state=42
    ),
    "Linear SVM": LinearSVC(
        C=1.0, max_iter=2000, random_state=42
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200, max_depth=None, min_samples_leaf=2, random_state=42, n_jobs=-1
    ),
    "Naive Bayes": MultinomialNB(alpha=0.1),
    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=150, learning_rate=0.1, max_depth=5, random_state=42
    ),
}


# ── Training & evaluation ───────────────────────────────────────────────────
def train_and_evaluate(df):
    print("\n🔧 Preprocessing text...")
    X = df['resume_text'].fillna('')
    y = df['label']

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    print(f"   Train size: {len(X_train)} | Test size: {len(X_test)}")

    # Build vectorizer on train set only
    print("\n📐 Building TF-IDF vectorizer...")
    vectorizer = build_vectorizer()
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    results = {}
    best_model_name = None
    best_f1 = 0
    best_model = None

    print("\n🏋️  Training models...\n")
    print(f"{'Model':<25} {'Accuracy':>10} {'F1 (macro)':>12} {'Precision':>11} {'Recall':>9} {'Time':>8}")
    print("─" * 80)

    for name, clf in MODELS.items():
        t0 = time.time()
        clf.fit(X_train_vec, y_train)
        elapsed = time.time() - t0

        y_pred = clf.predict(X_test_vec)

        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='macro')
        prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
        rec = recall_score(y_test, y_pred, average='macro', zero_division=0)

        results[name] = {
            "accuracy": round(acc, 4),
            "f1_macro": round(f1, 4),
            "precision_macro": round(prec, 4),
            "recall_macro": round(rec, 4),
            "train_time_sec": round(elapsed, 2),
        }

        print(f"{name:<25} {acc:>10.4f} {f1:>12.4f} {prec:>11.4f} {rec:>9.4f} {elapsed:>7.2f}s")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = clf

    print("─" * 80)
    print(f"\n🏆 Best model: {best_model_name} (F1 = {best_f1:.4f})")

    # ── Detailed report for best model ──────────────────────────────────────
    print(f"\n📊 Detailed Classification Report — {best_model_name}")
    y_pred_best = best_model.predict(X_test_vec)
    print(classification_report(y_test, y_pred_best, target_names=le.classes_))

    # ── Confusion matrix ─────────────────────────────────────────────────────
    cm = confusion_matrix(y_test, y_pred_best)
    print("Confusion Matrix:")
    print(pd.DataFrame(cm, index=le.classes_, columns=le.classes_).to_string())

    # ── Cross-validation ─────────────────────────────────────────────────────
    print(f"\n🔁 5-Fold Cross-Validation for {best_model_name}...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    X_all_vec = vectorizer.transform(X)
    cv_scores = cross_val_score(best_model, X_all_vec, y_encoded, cv=skf, scoring='f1_macro', n_jobs=-1)
    print(f"   CV F1 scores: {[round(s, 4) for s in cv_scores]}")
    print(f"   Mean: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    results[best_model_name]["cv_f1_mean"] = round(cv_scores.mean(), 4)
    results[best_model_name]["cv_f1_std"] = round(cv_scores.std(), 4)

    return vectorizer, le, best_model, best_model_name, results


# ── Save artifacts ──────────────────────────────────────────────────────────
def save_artifacts(vectorizer, le, model, model_name, results):
    print(f"\n💾 Saving model artifacts to {MODEL_DIR}/...")

    joblib.dump(vectorizer, f"{MODEL_DIR}/tfidf_vectorizer.pkl")
    joblib.dump(le, f"{MODEL_DIR}/label_encoder.pkl")
    joblib.dump(model, f"{MODEL_DIR}/best_model.pkl")

    meta = {
        "best_model": model_name,
        "classes": list(le.classes_),
        "num_classes": len(le.classes_),
        "vectorizer_features": len(vectorizer.get_feature_names_out()),
        "results": results,
    }
    with open(f"{MODEL_DIR}/model_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print("   ✅ tfidf_vectorizer.pkl")
    print("   ✅ best_model.pkl")
    print("   ✅ label_encoder.pkl")
    print("   ✅ model_metadata.json")
    return meta


# ── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 80)
    print("  AI-Powered Resume Intelligence — ML Model Training Pipeline")
    print("=" * 80)

    if not os.path.exists(DATA_PATH):
        print(f"❌ Dataset not found at {DATA_PATH}")
        print("   Run: python generate_dataset.py first")
        sys.exit(1)

    df = load_data(DATA_PATH)
    vectorizer, le, model, model_name, results = train_and_evaluate(df)
    meta = save_artifacts(vectorizer, le, model, model_name, results)

    print("\n" + "=" * 80)
    print("✅ Training complete!")
    print(f"   Best model : {meta['best_model']}")
    print(f"   Classes    : {meta['classes']}")
    print(f"   Features   : {meta['vectorizer_features']:,} TF-IDF features")
    print("=" * 80)
