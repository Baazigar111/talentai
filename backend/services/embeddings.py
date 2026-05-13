import numpy as np

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding(text: str) -> np.ndarray:
    return get_model().encode(text, convert_to_numpy=True)

def generate_resume_embedding(candidate: dict) -> np.ndarray:
    skills = ", ".join(candidate.get("skills") or [])
    education = ", ".join(candidate.get("education") or [])
    experience = str(candidate.get("experience_years", 0))
    text = f"""
    Name: {candidate.get('name', '')}
    Skills: {skills}
    Experience: {experience} years
    Education: {education}
    Resume: {candidate.get('raw_text', '')[:1000]}
    """
    return generate_embedding(text.strip())

def generate_job_embedding(job: dict) -> np.ndarray:
    skills = ", ".join(job.get("required_skills") or [])
    text = f"""
    Job Title: {job.get('title', '')}
    Description: {job.get('description', '')}
    Required Skills: {skills}
    Minimum Experience: {job.get('min_experience', 0)} years
    """
    return generate_embedding(text.strip())

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    if norm == 0:
        return 0.0
    return float(dot / norm)