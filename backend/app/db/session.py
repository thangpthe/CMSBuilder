
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import DATABASE_URL


# Tao Engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)


# Tao SessionLocal
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Tao Base cho cac Model
class Base(DeclarativeBase):
    pass


# Ham cung cap Database Session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
