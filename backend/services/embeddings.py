import numpy as np
import os

USE_LIGHTWEIGHT = os.getenv("USE_LIGHTWEIGHT_EMBEDDINGS", "false").lower() == "true"

_model = None
_tfidf = None
_tfidf_fitted = False

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding(text: str) -> np.ndarray:
    if USE_LIGHTWEIGHT:
        return _tfidf_embedding(text)
    return get_model().encode(text, convert_to_numpy=True)

def _tfidf_embedding(text: str) -> np.ndarray:
    """Lightweight embedding using character n-grams — no model download needed."""
    from sklearn.feature_extraction.text import HashingVectorizer
    vectorizer = HashingVectorizer(n_features=384, ngram_range=(1,2), norm='l2')
    vec = vectorizer.transform([text]).toarray()[0]
    return vec.astype(np.float32)

def generate_resume_embedding(candidate: dict) -> np.ndarray:
    skills = ", ".join(candidate.get("skills") or [])
    education = ", ".join(candidate.get("education") or [])
    experience = str(candidate.get("experience_years", 0))
    text = f"Name: {candidate.get('name', '')} Skills: {skills} Experience: {experience} years Education: {education} Resume: {candidate.get('raw_text', '')[:1000]}"
    return generate_embedding(text.strip())

def generate_job_embedding(job: dict) -> np.ndarray:
    skills = ", ".join(job.get("required_skills") or [])
    text = f"Job Title: {job.get('title', '')} Description: {job.get('description', '')} Required Skills: {skills} Minimum Experience: {job.get('min_experience', 0)} years"
    return generate_embedding(text.strip())

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    if norm == 0:
        return 0.0
    return float(dot / norm)