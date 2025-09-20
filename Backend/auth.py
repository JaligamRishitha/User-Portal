from datetime import timedelta, timezone, datetime
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends, Request
from sqlmodel import Session, select
from models.user_model import User
from database import get_session
from typing import Annotated, Literal
from functools import wraps

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Hash plain password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Verify password against hashed
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Verify JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
#changed
async def get_current_user(token : Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(get_session)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code = 401, detail = 'Invalid Token')
    user = session.exec(select(User).where(User.email == payload.get('sub'))).first()
    if not user:
        raise HTTPException(status_code=404, detail = 'User Not Found')
    return user

#changed
def role_required(role: Literal["HR", "Manager", "Employee","Account Manager"]):
    """
    Returns a dependency that checks if the current user has the required role.
    """
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(status_code=403, detail=f"Requires {role} role")
        return current_user
    return Depends(dependency)


# # Get current user from token
# async def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
#     payload = verify_token(token)
#     if not payload:
#         raise HTTPException(status_code=401, detail="Invalid Token")
#     email = payload.get("sub")
#     if not email:
#         raise HTTPException(status_code=401, detail="Invalid Token: missing sub claim")
#     user = session.exec(select(User).where(User.email == email)).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User Not Found")
#     return user


# # Role-based dependency
# def role_required(*allowed_roles: str):
#     async def dependency(user: User = Depends(get_current_user)):
#         if user.role not in allowed_roles:
#             raise HTTPException(status_code=403, detail="Forbidden: insufficient permissions")
#         return user
#     return dependency
