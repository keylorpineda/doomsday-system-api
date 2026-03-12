from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Gestión del Fin - AI Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    AI_SERVICE_PORT: int = 8000
    NESTJS_API_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
