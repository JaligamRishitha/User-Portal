from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    environment: str = "development"
    
    # Database
    database_url: str
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "ukpn_portal"
    db_user: str = "ukpn_user"
    db_password: str = "ukpn_password"
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
