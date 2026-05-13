from sentence_transformers import SentenceTransformer
import numpy as np

# Load once at startup (downloads ~90MB first time)
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embedding(text: str) -> np.ndarray:
    """Generate embedding vector for any text."""
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding

def generate_resume_embedding(candidate: dict) -> np.ndarray:
    """Create a rich text representation of candidate for embedding."""
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
    """Create embedding for job description."""
    skills = ", ".join(job.get("required_skills") or [])
    text = f"""
    Job Title: {job.get('title', '')}
    Description: {job.get('description', '')}
    Required Skills: {skills}
    Minimum Experience: {job.get('min_experience', 0)} years
    """
    return generate_embedding(text.strip())

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors."""
    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)
    if norm == 0:
        return 0.0
    return float(dot / norm)