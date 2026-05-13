from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.job import Job, Application
from models.candidate import Candidate
from schemas.job import JobCreate, JobResponse
from services.ranking import rank_candidates_for_job
from typing import List

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/create", response_model=JobResponse)
def create_job(data: JobCreate, db: Session = Depends(get_db)):
    job = Job(
        title=data.title,
        description=data.description,
        required_skills=data.required_skills,
        min_experience=data.min_experience,
        location=data.location,
        salary_range=data.salary_range,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/", response_model=List[JobResponse])
def get_all_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": f"Job {job_id} deleted"}

@router.get("/{job_id}/rank-candidates")
def rank_candidates(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    candidates = db.query(Candidate).all()
    if not candidates:
        return {"message": "No candidates found", "ranked": []}

    # Convert to dicts for ranking
    candidate_dicts = []
    for c in candidates:
        candidate_dicts.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "skills": c.skills or [],
            "experience_years": c.experience.get("years", 0) if c.experience else 0,
            "education": c.education or [],
            "raw_text": c.raw_text or "",
        })

    job_dict = {
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills or [],
        "min_experience": job.min_experience or 0,
    }

    ranked = rank_candidates_for_job(candidate_dicts, job_dict)

    return {
        "job": job.title,
        "total_candidates": len(ranked),
        "ranked_candidates": [
            {
                "rank": i + 1,
                "candidate_id": r["candidate"]["id"],
                "name": r["candidate"]["name"],
                "email": r["candidate"]["email"],
                "ats_score": r["scores"]["final_score"],
                "skills_score": r["scores"]["skills_score"],
                "experience_score": r["scores"]["experience_score"],
                "semantic_score": r["scores"]["semantic_score"],
                "matched_skills": r["scores"]["matched_skills"],
            }
            for i, r in enumerate(ranked)
        ]
    }