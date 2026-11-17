
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, health, media, pages, content_blocks, public_pages
from app.services.media_service import UPLOAD_DIR
# Khoi tao FastAPI
app = FastAPI(
    title="CMSBuilder API",
    description="API for CMSBuilder",
    version="1.0.0"
)
# Cau hinh CORS cho Frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
 )
# Dang ky Health Router
app.include_router(health.router)
app.include_router(auth.router)
# Dang ky Media Router
app.include_router(media.router)
app.include_router(pages.router)
app.include_router(content_blocks.router)
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
