
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


if TYPE_CHECKING:
    from app.models.user import User
    from app.models.content_block import ContentBlock

class Media(Base):
    __tablename__ = "media"

    # Ma hinh anh
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Nguoi dung so huu hinh anh
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Ten file ban dau
    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    # Ten file sau khi doi
    stored_filename: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    # Duong dan tuong doi cua file
    file_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    # Dinh dang anh thuc te
    mime_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # Dung luong file tinh bang byte
    size_bytes: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    # Thoi diem tai anh
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Quan he: Media thuoc ve mot User
    owner: Mapped["User"] = relationship(
        "User",
        back_populates="media_items"
    )
    # Quan he: Media co the duoc su dung trong nhieu content block
    content_blocks: Mapped[list["ContentBlock"]] = relationship(
        "ContentBlock",
        back_populates="media",
        passive_deletes="all"
    )