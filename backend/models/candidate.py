from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float
from sqlalchemy.sql import func
from core.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    skills = Column(JSON)         # ["Python", "React", ...]
    experience = Column(JSON)     # [{"company": ..., "years": ...}]
    education = Column(JSON)      # [{"degree": ..., "institution": ...}]
    projects = Column(JSON)       # [{"name": ..., "description": ...}]
    resume_url = Column(String)
    embedding_id = Column(String) # FAISS index reference
    raw_text = Column(Text)       # full extracted resume text
    created_at = Column(DateTime(timezone=True), server_default=func.now())