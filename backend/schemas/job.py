from pydantic import BaseModel
from typing import List, Optional

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    min_experience: float = 0.0
    location: Optional[str] = None
    salary_range: Optional[str] = None

class JobResponse(BaseModel):
    id: int
    title: str
    description: str
    required_skills: List[str]
    min_experience: float
    location: Optional[str]
    salary_range: Optional[str]

    class Config:
        from_attributes = True