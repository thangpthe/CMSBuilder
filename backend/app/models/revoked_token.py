
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class RevokedToken(Base):
    __tablename__ = "revoked_tokens"

    jti: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
    )

    expires_at: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
