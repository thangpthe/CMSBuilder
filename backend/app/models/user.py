
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


if TYPE_CHECKING:
    from app.models.media import Media
    from app.models.page import Page

class User(Base):
    __tablename__ = "users"

    # Ma nguoi dung
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Ten dang nhap
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    # Email (khong bat buoc)
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True
    )

    # Mat khau da bam hash
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Vai tro: system_admin hoac page_admin
    role: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="page_admin"
    )

    # Trang thai tai khoan
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    # Thoi diem tao tai khoan
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Quan he: Mot User co nhieu Media
    media_items: Mapped[list["Media"]] = relationship(
        "Media",
        back_populates="owner"
    )
     # Mot User co nhieu Page
    pages: Mapped[list["Page"]] = relationship(
        "Page",
        back_populates="owner"
    )
