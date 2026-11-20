
import os
from pathlib import Path

from dotenv import load_dotenv


# Xac dinh thu muc Backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Doc file .env
load_dotenv(BACKEND_DIR / ".env")


# Cau hinh Database
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/cmsbuilder"
)


# Cau hinh JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
