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
    
    # Email
    smtp_host: str = "smtp.office365.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    notification_email: str = "rishitha.jaligam@nxzen.com"
    
    # OCR
    ocr_api_key: str = "ocr_k-DvHxnw9FNzuyoqX5gBf453NZXL5E1LllrFevcHsXs"
    
    # Google Maps
    google_maps_api_key: str = "AIzaSyCYH2Z1OoL1wOX2ik1UOKTR-YjM2QRMRYY"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
