from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from schemas import LoginRequest, LoginResponse, Token
from database import get_db
from config import get_settings

router = APIRouter()
settings = get_settings()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint
    Default credentials: username=admin, password=admin
    """
    # Simple authentication (replace with proper auth in production)
    if request.username == "admin" and request.password == "admin":
        token = create_access_token(
            data={"sub": "5000000061", "username": request.username}
        )
        
        return LoginResponse(
            success=True,
            token=token,
            user={
                "id": "5000000061",
                "username": request.username,
                "firstName": "James",
                "lastName": "Anderson"
            }
        )
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {
        "success": True,
        "message": "Logged out successfully"
    }
