from services.embeddings import generate_resume_embedding, generate_job_embedding, cosine_similarity
from services.vector_store import vector_store
import numpy as np

def calculate_ats_score(candidate: dict, job: dict) -> dict:
    """
    Scoring Formula:
    40% Skills Match
    30% Experience
    20% Semantic Similarity
    10% Education
    """
    # 1. Skills Match (40%)
    candidate_skills = set(s.lower() for s in (candidate.get("skills") or []))
    required_skills = set(s.lower() for s in (job.get("required_skills") or []))
    
    if required_skills:
        matched = candidate_skills & required_skills
        skills_score = len(matched) / len(required_skills)
    else:
        skills_score = 0.5
    
    # 2. Experience Match (30%)
    exp_years = candidate.get("experience_years", 0)
    min_exp = job.get("min_experience", 0)
    
    if min_exp == 0:
        exp_score = 1.0
    elif exp_years >= min_exp:
        exp_score = 1.0
    else:
        exp_score = exp_years / min_exp
    
    # 3. Semantic Similarity (20%)
    candidate_emb = generate_resume_embedding(candidate)
    job_emb = generate_job_embedding(job)
    semantic_score = cosine_similarity(candidate_emb, job_emb)
    semantic_score = max(0, semantic_score)  # ensure non-negative
    
    # 4. Education (10%)
    education = candidate.get("education") or []
    edu_score = min(len(education) / 2, 1.0)  # max score with 2+ entries
    
    # Final weighted score
    final_score = (
        skills_score * 0.40 +
        exp_score * 0.30 +
        semantic_score * 0.20 +
        edu_score * 0.10
    )
    
    return {
        "final_score": round(final_score * 100, 2),  # percentage
        "skills_score": round(skills_score * 100, 2),
        "experience_score": round(exp_score * 100, 2),
        "semantic_score": round(semantic_score * 100, 2),
        "education_score": round(edu_score * 100, 2),
        "matched_skills": list(candidate_skills & required_skills),
    }

def rank_candidates_for_job(candidates: list, job: dict) -> list:
    """Rank all candidates for a job and return sorted list."""
    job_emb = generate_job_embedding(job)
    
    # Search vector store for similar candidates
    similar = vector_store.search(job_emb, top_k=len(candidates) or 10)
    similar_ids = {r["candidate_id"]: r["similarity_score"] for r in similar}
    
    ranked = []
    for candidate in candidates:
        score_breakdown = calculate_ats_score(candidate, job)
        ranked.append({
            "candidate": candidate,
            "scores": score_breakdown,
        })
    
    # Sort by final score descending
    ranked.sort(key=lambda x: x["scores"]["final_score"], reverse=True)
    return ranked