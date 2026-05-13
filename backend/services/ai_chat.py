import httpx
from groq import Groq
from sqlalchemy.orm import Session
from models.candidate import Candidate
from core.config import settings

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:latest"

def get_candidates_context(db: Session) -> str:
    candidates = db.query(Candidate).all()
    if not candidates:
        return "No candidates in the database yet."
    
    context = "Here are the candidates in the TalentAI database:\n\n"
    for c in candidates:
        exp = c.experience.get("years", 0) if c.experience else 0
        skills = ", ".join(c.skills or [])
        edu = "; ".join(c.education or [])
        context += f"""Candidate ID: {c.id}
Name: {c.name}
Email: {c.email}
Skills: {skills}
Experience: {exp} years
Education: {edu}
---
"""
    return context

def build_prompt(message: str, candidates_context: str) -> str:
    return f"""You are an intelligent AI recruiter assistant for TalentAI platform.
You help recruiters find and evaluate candidates based on their data.

CANDIDATE DATABASE:
{candidates_context}

RECRUITER'S QUESTION: {message}

Instructions:
- Answer based on the candidate data provided
- Be specific, mention candidate names and relevant skills
- If asked for best candidate, explain why with data points
- Keep response concise and professional (2-4 sentences)
- If no candidates match, say so clearly

Your response:"""

async def chat_with_groq(message: str, db: Session) -> dict:
    """Use Groq API (cloud, works in deployment)."""
    candidates_context = get_candidates_context(db)
    prompt = build_prompt(message, candidates_context)
    
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert AI recruiter assistant. Be concise, data-driven, and helpful."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=400,
        )
        response_text = completion.choices[0].message.content.strip()
        return {
            "response": response_text,
            "powered_by": "groq/llama-3.3-70b",
            "candidates": None
        }
    except Exception as e:
        print(f"Groq error: {e}")
        return await chat_with_ollama_fallback(message, db)

async def chat_with_ollama_fallback(message: str, db: Session) -> dict:
    """Ollama local fallback (works in development)."""
    candidates_context = get_candidates_context(db)
    prompt = build_prompt(message, candidates_context)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 300,
                }
            })
            if response.status_code == 200:
                data = response.json()
                return {
                    "response": data.get("response", "").strip(),
                    "powered_by": "ollama/llama3.2",
                    "candidates": None
                }
    except Exception as e:
        print(f"Ollama error: {e}")
    
    return fallback_chat(message, db)

async def chat_with_ai(message: str, db: Session) -> dict:
    """
    Smart routing:
    - Groq API key set → use Groq (best for deployment)
    - Ollama running locally → use Ollama (best for development)  
    - Neither → rule-based fallback
    """
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "":
        return await chat_with_groq(message, db)
    return await chat_with_ollama_fallback(message, db)

def fallback_chat(message: str, db: Session) -> dict:
    """Rule-based fallback when no AI available."""
    msg = message.lower()
    candidates = db.query(Candidate).all()

    if not candidates:
        return {"response": "No candidates in the database yet. Upload some resumes first!", "candidates": []}

    if any(w in msg for w in ["best", "top", "recommend", "who should", "strongest"]):
        top = candidates[0]
        skills_preview = ", ".join((top.skills or [])[:5])
        return {
            "response": f"Based on available data, {top.name} appears strong with skills: {skills_preview}.",
            "candidates": [{"id": top.id, "name": top.name, "email": top.email, "skills": top.skills}]
        }

    skill_keywords = [
        "python", "react", "fastapi", "node", "django", "aws", "docker",
        "machine learning", "langchain", "sql", "javascript", "typescript",
        "mongodb", "postgresql", "go", "rust", "java", "c++"
    ]
    found_skill = next((s for s in skill_keywords if s in msg), None)

    if found_skill:
        matched = [c for c in candidates if c.skills and any(found_skill in s.lower() for s in c.skills)]
        if matched:
            return {
                "response": f"Found {len(matched)} candidate(s) with {found_skill} experience:",
                "candidates": [{"id": c.id, "name": c.name, "email": c.email, "skills": c.skills} for c in matched]
            }
        return {"response": f"No candidates found with {found_skill} skills.", "candidates": []}

    if any(w in msg for w in ["how many", "list", "all", "show all", "count"]):
        return {
            "response": f"There are {len(candidates)} candidate(s) in the database:",
            "candidates": [{"id": c.id, "name": c.name, "email": c.email} for c in candidates]
        }

    return {
        "response": f"I found {len(candidates)} candidate(s). Try: 'Find Python developers', 'Who is best for backend?'",
        "candidates": None
    }