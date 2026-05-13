from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    UPLOAD_DIR: str = "./uploads"
    APP_ENV: str = "development"
    MAX_UPLOAD_SIZE: int = 5242880
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"  # ← this ignores any extra fields in .env

settings = Settings()