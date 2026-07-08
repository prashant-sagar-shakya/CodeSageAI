import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeSageAI API"
    API_V1_STR: str = "/api/v1"
    
    # Security & Authentication
    SECRET_KEY: str = Field("codesageai-deep-agentic-secret-key-1823908", validation_alias="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Gemini AI Configuration
    GEMINI_API_KEY: str = Field(..., validation_alias="GEMINI_API_KEY")
    
    # Database Config (Default to SQLite for local ease, PostgreSQL ready)
    DATABASE_URL: str = Field("sqlite:///./codesage.db", validation_alias="DATABASE_URL")
    
    # Redis Config for Queue/Cache
    REDIS_URL: str = Field("redis://localhost:6379/0", validation_alias="REDIS_URL")
    
    # GitHub App Credentials (required for writing reviews, comments, and catching webhooks)
    GITHUB_APP_ID: str = Field("", validation_alias="GITHUB_APP_ID")
    GITHUB_APP_PRIVATE_KEY: str = Field("", validation_alias="GITHUB_APP_PRIVATE_KEY")
    GITHUB_WEBHOOK_SECRET: str = Field("", validation_alias="GITHUB_WEBHOOK_SECRET")
    GITHUB_CLIENT_ID: str = Field("", validation_alias="GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str = Field("", validation_alias="GITHUB_CLIENT_SECRET")

    model_config = SettingsConfigDict(
        # Try local backend .env, root .env, and frontend .env if available
        env_file=(".env", "../.env", "../frontend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
