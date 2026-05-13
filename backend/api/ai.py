from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db
from models.candidate import Candidate
from services.embeddings import generate_embedding
from services.vector_store import vector_store
from services.ranking import calculate_ats_score
from services.ai_chat import chat_with_ai
from core.config import settings

router = APIRouter(prefix="/ai", tags=["AI"])

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class ChatRequest(BaseModel):
    message: str

class MatchRequest(BaseModel):
    job_title: str
    description: str
    required_skills: list[str]
    min_experience: float = 0.0

@router.post("/search")
def semantic_search(data: SearchRequest, db: Session = Depends(get_db)):
    query_emb = generate_embedding(data.query)
    results = vector_store.search(query_emb, top_k=data.top_k)

    if not results:
        return {"query": data.query, "results": [], "message": "No candidates found"}

    enriched = []
    for r in results:
        candidate = db.query(Candidate).filter(Candidate.id == r["candidate_id"]).first()
        if candidate:
            enriched.append({
                "candidate_id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "skills": candidate.skills,
                "similarity_score": round(r["similarity_score"] * 100, 2),
                "experience_years": candidate.experience.get("years", 0) if candidate.experience else 0,
            })

    return {"query": data.query, "total_results": len(enriched), "results": enriched}

@router.post("/match")
def match_candidates(data: MatchRequest, db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    if not candidates:
        return {"results": [], "message": "No candidates in database"}

    job_dict = {
        "title": data.job_title,
        "description": data.description,
        "required_skills": data.required_skills,
        "min_experience": data.min_experience,
    }

    scored = []
    for c in candidates:
        candidate_dict = {
            "id": c.id, "name": c.name, "skills": c.skills or [],
            "experience_years": c.experience.get("years", 0) if c.experience else 0,
            "education": c.education or [], "raw_text": c.raw_text or "",
        }
        scores = calculate_ats_score(candidate_dict, job_dict)
        scored.append({
            "candidate_id": c.id, "name": c.name, "email": c.email,
            "ats_score": scores["final_score"],
            "matched_skills": scores["matched_skills"],
            "skills_score": scores["skills_score"],
            "semantic_score": scores["semantic_score"],
        })

    scored.sort(key=lambda x: x["ats_score"], reverse=True)
    return {"job": data.job_title, "total": len(scored), "results": scored}

@router.post("/chat")
async def ai_chat(data: ChatRequest, db: Session = Depends(get_db)):
    """AI chat — uses Ollama if available, falls back to rule-based."""
    result = await chat_with_ai(data.message, db)
    return result

@router.get("/status")
def ai_status():
    groq_active = bool(settings.GROQ_API_KEY)
    
    ollama_active = False
    ollama_models = []
    try:
        import httpx
        r = httpx.get("http://localhost:11434/api/tags", timeout=3)
        ollama_models = [m["name"] for m in r.json().get("models", [])]
        ollama_active = True
    except:
        pass

    if groq_active:
        return {
            "ollama": False,
            "groq": True,
            "models": ["llama-3.3-70b-versatile"],
            "status": "Groq API active ✅",
            "provider": "groq"
        }
    elif ollama_active:
        return {
            "ollama": True,
            "groq": False,
            "models": ollama_models,
            "status": "Ollama running ✅",
            "provider": "ollama"
        }
    else:
        return {
            "ollama": False,
            "groq": False,
            "models": [],
            "status": "Rule-based fallback",
            "provider": "fallback"
        }

@router.post("/chat")
async def ai_chat(data: ChatRequest, db: Session = Depends(get_db)):
    result = await chat_with_ai(data.message, db)
    return result