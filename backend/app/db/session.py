import os
from pathlib import Path

from sqlalchemy import create_engine

BACKEND_DIR = Path(__file__).resolve().parents[2]
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR / 'cmsbuilder.db'}")

engine = create_engine(DATABASE_URL)
