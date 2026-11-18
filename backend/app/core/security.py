from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import (
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)
from app.db.session import get_db
from app.models.user import User


password_hash = PasswordHash.recommended()

# Router đăng nhập dùng hash này khi không tìm thấy tài khoản.
DUMMY_HASH = password_hash.hash("dummy-password-not-used-by-any-account")

bearer_scheme = HTTPBearer(auto_error=False)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return password_hash.verify(plain_password, hashed_password)
    except Exception:
        # Từ chối đăng nhập nếu hash đã lưu không đọc được.
        return False


def create_access_token(user_id: int) -> str:
    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY chua duoc cau hinh.")

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "exp": expires_at,
        "jti": str(uuid4()),
    }

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def get_token_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """Kiểm tra chữ ký, hạn dùng và trạng thái thu hồi của JWT."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Khong tim thay hoac Token khong hop le.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    if not JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY chua duoc cau hinh.")

    try:
        claims = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp", "jti"]},
        )
        # ID người dùng trong bảng users có kiểu số nguyên.
        int(claims["sub"])
    except (InvalidTokenError, ValueError, TypeError) as error:
        raise unauthorized from error

    revoked = db.scalar(
        text("SELECT 1 FROM revoked_tokens WHERE jti = :jti"),
        {"jti": claims["jti"]},
    )
    if revoked is not None:
        raise unauthorized

    return claims


def get_current_user(
    claims: dict = Depends(get_token_claims),
    db: Session = Depends(get_db),
) -> User:
    """Lấy tài khoản đang hoạt động từ JWT đã được kiểm tra."""
    current_user = db.get(User, int(claims["sub"]))

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Khong tim thay hoac Token khong hop le.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tai khoan da bi vo hieu hoa.",
        )

    return current_user