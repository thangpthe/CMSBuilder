
from app.core.config import DATABASE_URL
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# Xac dinh thu muc Backend
BACKEND_DIR = Path(__file__).resolve().parents[2]



# Cau hinh ket noi SQLite
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Tao Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

# Bat kiem tra Foreign Key cho SQLite
if DATABASE_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


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
