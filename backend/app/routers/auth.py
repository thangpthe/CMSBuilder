import time
import logging
import jwt
from sqlalchemy import func, or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from fastapi.security import HTTPAuthorizationCredentials

from app.core.config import JWT_SECRET_KEY, JWT_ALGORITHM
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
    bearer_scheme,
    DUMMY_HASH
)

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserAuthInfo,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):

    # Lay username hoac email
    identifier = login_data.identifier.strip()

    # Tim User trong Database
    statement = select(User).where(
        or_(
            User.username == identifier,
            User.email == identifier
        )
    )

    user = db.scalar(statement)

    # Neu khong tim thay User
    if user is None:

        # Kiem tra hash gia de giam rui ro timing attack
        verify_password(
            login_data.password,
            DUMMY_HASH
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ten dang nhap hoac mat khau khong chinh xac.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Kiem tra mat khau
    if not verify_password(
        login_data.password,
        user.hashed_password
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ten dang nhap hoac mat khau khong chinh xac.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Kiem tra trang thai tai khoan
    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tai khoan da bi vo hieu hoa."
        )

    # Tao JWT sau khi dang nhap thanh cong
    access_token = create_access_token(user.id)

    # Tra Token va thong tin User cho Frontend
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }
    )

@router.get("/me")
def read_current_user(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if credentials and credentials.scheme.lower() == "bearer" and JWT_SECRET_KEY:
        try:
            claims = jwt.decode(
                credentials.credentials,
                JWT_SECRET_KEY,
                algorithms=[JWT_ALGORITHM],
                options={"require": ["sub", "exp", "jti"]},
            )
            now = int(time.time())
            db.execute(
                text("DELETE FROM revoked_tokens WHERE expires_at <= :now"),
                {"now": now},
            )
            db.execute(
                text("""
                    INSERT INTO revoked_tokens (jti, expires_at)
                    VALUES (:jti, :expires_at)
                    ON CONFLICT(jti) DO NOTHING
                """),
                {"jti": claims["jti"], "expires_at": claims["exp"]},
            )
            db.commit()
        except Exception:
            # Token khong hop le hoac da het han -> khong can thu hoi
            pass

    return {"message": "Da dang xuat"}


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new page_admin user account."""
    # Check duplicate username case-insensitively
    existing_username = db.scalar(
        select(User).where(
            func.lower(User.username) == register_data.username.lower()
        )
    )
    if existing_username is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tên đăng nhập đã tồn tại.",
        )

    # Check duplicate email case-insensitively when provided
    if register_data.email is not None:
        existing_email = db.scalar(
            select(User).where(
                func.lower(User.email) == register_data.email.lower()
            )
        )
        if existing_email is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email đã được sử dụng.",
            )

    new_user = User(
        username=register_data.username,
        email=register_data.email,
        hashed_password=get_password_hash(register_data.password),
        role="page_admin",
        is_active=True,
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tên đăng nhập hoặc email đã tồn tại.",
        ) from error

    db.refresh(new_user)

    return RegisterResponse(
        message="Đăng ký tài khoản thành công. Vui lòng đăng nhập.",
        user=UserAuthInfo(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            role=new_user.role,
        ),
    )
