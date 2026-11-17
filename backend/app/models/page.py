
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.content_block import ContentBlock


class Page(Base):
    __tablename__ = "pages"

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'published')",
            name="ck_pages_status"
        ),
    )

    # Ma trang
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Nguoi dung so huu trang
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Tieu de trang
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Mo ta trang
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Duong dan duy nhat
    slug: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True
    )

    # Trang thai Draft hoac Published
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        server_default="draft"
    )

    # Thoi diem tao trang
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Thoi diem cap nhat trang
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Thoi diem xuat ban
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Quan he voi User
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="pages"
    )

    # Mot Page co nhieu ContentBlock
    content_blocks: Mapped[list["ContentBlock"]] = relationship(
        "ContentBlock",
        back_populates="page",
        cascade="all, delete-orphan",
        order_by="ContentBlock.order_index"
    )
