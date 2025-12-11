from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from schemas import LoginRequest, LoginResponse, Token
from database import get_db
from config import get_settings
from models import Vendor

router = APIRouter()
settings = get_settings()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"Password verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash for a password"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint - authenticate with email and password
    """
    # Query vendor by email
    vendor = db.query(Vendor).filter(Vendor.email == request.email).first()
    
    if not vendor:
        raise HTTPException(
            status_code=401,
            detail="Invalid email address or password"
        )
    
    # Verify password
    if not verify_password(request.password, vendor.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email address or password"
        )
    
    # Create access token
    token = create_access_token(
        data={"sub": vendor.vendor_id, "email": vendor.email}
    )
    
    return LoginResponse(
        success=True,
        token=token,
        user={
            "id": vendor.vendor_id,
            "email": vendor.email,
            "firstName": vendor.first_name,
            "lastName": vendor.last_name
        }
    )

@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {
        "success": True,
        "message": "Logged out successfully"
    }
