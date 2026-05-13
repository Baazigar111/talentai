from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import Base, engine
from api import auth, resume, jobs, ai
import os

# Create DB tables
Base.metadata.create_all(bind=engine)

# Create upload directory
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="TalentAI API", version="1.0.0")

# CORS (allow frontend to talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {"message": "TalentAI API is running 🚀"}