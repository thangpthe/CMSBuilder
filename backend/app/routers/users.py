
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserListResponse


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


def require_system_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ban khong co quyen truy cap chuc nang nay.",
        )

    return current_user


@router.get(
    "",
    response_model=UserListResponse,
    summary="Get all users (system admin only)",
)
def get_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    role: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    _: User = Depends(require_system_admin),
):
    filters = []

    if role is not None:
        filters.append(User.role == role)

    if is_active is not None:
        filters.append(User.is_active == is_active)

    total_statement = select(func.count()).select_from(User)
    users_statement = select(User)

    if filters:
        total_statement = total_statement.where(*filters)
        users_statement = users_statement.where(*filters)

    total = db.scalar(total_statement) or 0

    users_statement = (
        users_statement
        .order_by(User.id.asc())
        .offset(skip)
        .limit(limit)
    )

    users = db.scalars(users_statement).all()

    return UserListResponse(
        items=users,
        total=total,
        skip=skip,
        limit=limit,
    )
