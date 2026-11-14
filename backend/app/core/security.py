
from datetime import datetime, timedelta, timezone

import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from sqlalchemy.orm import Session

from app.core.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.db.session import get_db
from app.models.user import User


# Khoi tao cong cu hash mat khau
password_hash = PasswordHash.recommended()

# Hash gia de kiem tra khi username khong ton tai
DUMMY_HASH = password_hash.hash(
    "dummy-password-not-used-by-any-account"
)


# Cau hinh Bearer Token
bearer_scheme = HTTPBearer(auto_error=False)


# Hash mat khau truoc khi luu Database
def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


# Kiem tra mat khau voi chuoi hash
def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    try:
        return password_hash.verify(
            plain_password,
            hashed_password
        )

    except Exception:
        # Tu choi hash khong hop le
        return False


# Tao JWT cho User
def create_access_token(user_id: int) -> str:

    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY chua duoc cau hinh."
        )

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token


# Lay User hien tai tu JWT
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Khong tim thay hoac Token khong hop le.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise credentials_exception

    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY chua duoc cau hinh."
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp"]}
        )

        subject = payload.get("sub")
        user_id = int(subject)

    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_exception

    current_user = db.get(User, user_id)

    if current_user is None:
        raise credentials_exception

    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tai khoan da bi vo hieu hoa."
        )

    return current_user
