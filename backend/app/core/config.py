import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nyaya-Setu"
    API_V1_STR: str = "/api/v1"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MODEL_NAME: str = "gpt-4o"
    class Config:
        case_sensitive = True

settings = Settings()
