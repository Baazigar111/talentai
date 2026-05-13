from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.config import settings
from services.resume_parser import parse_resume
from utils.file_handler import save_upload_file
from models.candidate import Candidate
from schemas.candidate import CandidateResponse
from services.embeddings import generate_resume_embedding
from services.vector_store import vector_store

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=CandidateResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file to disk
    file_path, unique_name = await save_upload_file(file, settings.UPLOAD_DIR)

    # Parse resume
    parsed = parse_resume(file_path, file.filename)

    # Save candidate to DB
    candidate = Candidate(
        name=parsed["name"],
        email=parsed["email"],
        phone=parsed["phone"],
        skills=parsed["skills"],
        experience={"years": parsed["experience_years"]},
        education=parsed["education"],
        resume_url=f"{settings.UPLOAD_DIR}/{unique_name}",
        raw_text=parsed["raw_text"],
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    emb = generate_resume_embedding({
        "name": candidate.name,
        "skills": candidate.skills,
        "experience_years": parsed["experience_years"],
        "education": candidate.education,
        "raw_text": parsed["raw_text"],
    })
    vector_store.add_candidate(candidate.id, emb)

    return CandidateResponse(
        id=candidate.id,
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone,
        skills=candidate.skills,
        experience_years=parsed["experience_years"],
        education=candidate.education,
        resume_url=candidate.resume_url,
    )

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    exp_years = candidate.experience.get("years", 0) if candidate.experience else 0
    return CandidateResponse(
        id=candidate.id,
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone,
        skills=candidate.skills,
        experience_years=exp_years,
        education=candidate.education,
        resume_url=candidate.resume_url,
    )

@router.patch("/{candidate_id}/update-name")
def update_candidate_name(candidate_id: int, name: str, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    candidate.name = name
    db.commit()
    return {"message": "Name updated", "name": name}

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": f"Candidate {candidate_id} deleted"}