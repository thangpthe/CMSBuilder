
import logging

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from app.core.security import (
    create_access_token,
    verify_password,
    DUMMY_HASH
)

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse


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

    # Tra Token cho Frontend
    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
