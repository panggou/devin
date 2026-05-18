import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "OpsInsight"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://opsinsight:opsinsight@localhost:5432/opsinsight",
    )

    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me-in-production-use-a-strong-secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
