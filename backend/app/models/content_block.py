
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
    from app.models.page import Page
    from app.models.media import Media


class ContentBlock(Base):
    __tablename__ = "content_blocks"

    __table_args__ = (
        CheckConstraint(
            "type IN ('text', 'image', 'video')",
            name="ck_content_blocks_type"
        ),
    )

    # Ma block
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Page chua block
    page_id: Mapped[int] = mapped_column(
        ForeignKey("pages.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Loai block: text, image, video
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    # Noi dung text hoac URL video
    content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Media lien ket voi Image Block
    media_id: Mapped[int | None] = mapped_column(
        ForeignKey("media.id", ondelete="RESTRICT"),
        nullable=True,
        index=True
    )

    # Thu tu hien thi
    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    # Thoi diem tao
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Thoi diem cap nhat
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # Quan he voi Page
    page: Mapped["Page"] = relationship(
        "Page",
        back_populates="content_blocks"
    )

    # Quan he voi Media
    media: Mapped["Media | None"] = relationship(
        "Media",
        back_populates="content_blocks"
    )
