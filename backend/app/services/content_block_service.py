
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.page import Page
from app.models.media import Media
from app.models.content_block import ContentBlock


# Xac dinh thu muc Backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Thu muc luu hinh anh
UPLOAD_DIR = (BACKEND_DIR / "uploads" / "images").resolve()


# Cac loi nghiep vu
class PageNotFoundError(Exception):
    pass


class MediaNotFoundError(Exception):
    pass


class MediaFileMissingError(Exception):
    pass


# Tao Image Block va lien ket voi Media
def create_image_block(
    db: Session,
    page_id: int,
    owner_id: int,
    media_id: int,
    order_index: int = 0
) -> tuple[ContentBlock, Media]:

    # Buoc 1: Kiem tra Page va quyen so huu
    page_statement = select(Page).where(
        Page.id == page_id,
        Page.owner_id == owner_id
    )

    page = db.scalar(page_statement)

    if page is None:
        raise PageNotFoundError(
            "Khong tim thay Page."
        )

    # Buoc 2: Kiem tra Media va quyen so huu
    media_statement = select(Media).where(
        Media.id == media_id,
        Media.owner_id == owner_id
    )

    media = db.scalar(media_statement)

    if media is None:
        raise MediaNotFoundError(
            "Khong tim thay hinh anh."
        )

    # Buoc 3: Kiem tra file anh thuc te
    image_path = (
        BACKEND_DIR / media.file_path
    ).resolve()

    # Dam bao file nam trong thu muc uploads/images
    try:
        image_path.relative_to(UPLOAD_DIR)

    except ValueError:
        raise MediaFileMissingError(
            "Duong dan hinh anh khong hop le."
        )

    if not image_path.is_file():
        raise MediaFileMissingError(
            "File hinh anh khong ton tai tren Backend."
        )

    # Buoc 4: Tao ContentBlock moi
    new_block = ContentBlock(
        page_id=page.id,
        type="image",
        content=None,
        media_id=media.id,
        order_index=order_index
    )

    try:

        db.add(new_block)

        # Gui du lieu xuong Database
        db.flush()

        # Lay ID do Database tao ra
        db.refresh(new_block)

        # Xac nhan giao dich
        db.commit()

        return new_block, media

    except Exception:

        # Huy giao dich neu co loi
        db.rollback()

        raise
