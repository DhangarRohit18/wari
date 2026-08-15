from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./wariverse.db"
    SECRET_KEY: str = "wariverse-ai-super-secret-key-2024-hackathon"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    GEMINI_API_KEY: str = ""
    DEMO_MODE: bool = True
    APP_NAME: str = "WariVerse AI"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
