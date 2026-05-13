from pydantic import BaseModel
from typing import List, Optional

class CandidateResponse(BaseModel):
    id: int
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    skills: Optional[List[str]]
    experience_years: Optional[float]
    education: Optional[List[str]]
    resume_url: Optional[str]

    class Config:
        from_attributes = True