import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from cryptography.fernet import InvalidToken
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from passlib.hash import pbkdf2_sha256 as password_hasher

from ..security.encryption import decrypt_token, encrypt_token

SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_EXP_MINUTES", "60"))

security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    # Ensure subject is a string per JWT subject requirements
    if "sub" in to_encode and not isinstance(to_encode["sub"], str):
        to_encode["sub"] = str(to_encode["sub"])
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET, algorithm=ALGORITHM)
    return encrypt_token(token)


def decode_access_token(token: str) -> dict:
    try:
        decrypted = decrypt_token(token)
        payload = jwt.decode(decrypted, SECRET, algorithms=[ALGORITHM])
        return payload
    except InvalidToken:
        raise HTTPException(status_code=401, detail="Token decryption failed")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_token_from_header(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    return credentials.credentials


def verify_password(plain: str, hashed: str) -> bool:
    return password_hasher.verify(plain, hashed)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def get_current_user(token: str = Depends(get_token_from_header)) -> dict:
    payload = decode_access_token(token)
    # payload should contain 'sub' as user id or email
    return payload
