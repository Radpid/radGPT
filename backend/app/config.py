from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    gemini_api_key: str
    cors_origins: List[str] = ["http://localhost:5173"]

    class Config:
        # Chercher le fichier .env dans le répertoire backend
        env_file = os.path.join(Path(__file__).parent.parent, ".env")

settings = Settings()
