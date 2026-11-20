import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, health, media, pages, content_blocks, public_pages, users
from app.services.media_service import UPLOAD_DIR

# Khoi tao FastAPI
app = FastAPI(
    title="CMSBuilder API",
    description="API for CMSBuilder",
    version="1.0.0"
)

# Cau hinh CORS cho Frontend React
cors_origins_env = os.getenv("CORS_ORIGINS", "")
custom_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

allowed_origins = list(set(default_origins + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Dang ky Health Router
app.include_router(health.router)

# Dang ky Auth Router
app.include_router(auth.router)

# Dang ky Users Router
app.include_router(users.router)

# Dang ky Media Router
app.include_router(media.router)

# Dang ky Pages Router
app.include_router(pages.router)

# Dang ky Content Blocks Router
app.include_router(content_blocks.router)

# Dang ky Public Pages Router
app.include_router(public_pages.router)

# Phuc vu hinh anh da upload
app.mount(
    "/uploads",
    StaticFiles(
        directory=str(UPLOAD_DIR.parent),
        check_dir=False
    ),
    name="uploads"
)