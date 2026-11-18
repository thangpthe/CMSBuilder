from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.page import Page
from app.models.media import Media
from app.models.content_block import ContentBlock
from app.schemas.content_block import validate_video_url


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


class BlockNotFoundError(Exception):
    pass


class InvalidBlockDataError(Exception):
    pass


def _get_owned_page(db: Session, page_id: int, owner_id: int) -> Page:
    page = db.scalar(
        select(Page).where(
            Page.id == page_id,
            Page.owner_id == owner_id
        )
    )
    if page is None:
        raise PageNotFoundError("Khong tim thay Page.")
    return page


def _validate_owned_media(db: Session, media_id: int, owner_id: int) -> Media:
    media = db.scalar(
        select(Media).where(
            Media.id == media_id,
            Media.owner_id == owner_id
        )
    )
    if media is None:
        raise MediaNotFoundError("Khong tim thay hinh anh.")

    image_path = (BACKEND_DIR / media.file_path).resolve()
    try:
        image_path.relative_to(UPLOAD_DIR)
    except ValueError:
        raise MediaFileMissingError("Duong dan hinh anh khong hop le.")

    if not image_path.is_file():
        raise MediaFileMissingError("File hinh anh khong ton tai tren Backend.")

    return media


# Tao Image Block va lien ket voi Media (giu tuong thich nguoc)
def create_image_block(
    db: Session,
    page_id: int,
    owner_id: int,
    media_id: int,
    order_index: int = 0
) -> tuple[ContentBlock, Media]:
    block, media = create_block(
        db=db,
        page_id=page_id,
        owner_id=owner_id,
        block_type="image",
        content=None,
        media_id=media_id,
        order_index=order_index
    )
    assert media is not None
    return block, media


# Tao ContentBlock moi (text | image | video)
def create_block(
    db: Session,
    page_id: int,
    owner_id: int,
    block_type: str,
    content: str | None = None,
    media_id: int | None = None,
    order_index: int | None = None
) -> tuple[ContentBlock, Media | None]:

    page = _get_owned_page(db, page_id, owner_id)

    media: Media | None = None
    stored_content: str | None = None
    stored_media_id: int | None = None

    if block_type == "image":
        if media_id is None:
            raise InvalidBlockDataError("media_id la bat buoc doi voi Image Block.")
        media = _validate_owned_media(db, media_id, owner_id)
        stored_media_id = media.id
    elif block_type == "video":
        try:
            stored_content = validate_video_url(content)
        except ValueError as err:
            raise InvalidBlockDataError(str(err))
    elif block_type == "text":
        stored_content = content if content is not None else ""
    else:
        raise InvalidBlockDataError("Loai block khong hop le.")

    if order_index is None:
        max_order = db.scalar(
            select(func.max(ContentBlock.order_index)).where(
                ContentBlock.page_id == page.id
            )
        )
        order_index = (max_order + 1) if max_order is not None else 0

    new_block = ContentBlock(
        page_id=page.id,
        type=block_type,
        content=stored_content,
        media_id=stored_media_id,
        order_index=order_index
    )

    try:
        db.add(new_block)
        db.flush()
        db.refresh(new_block)
        db.commit()
        return new_block, media

    except Exception:
        db.rollback()
        raise


# Lay danh sach ContentBlock cua Page theo thu tu
def get_page_blocks(
    db: Session,
    page_id: int,
    owner_id: int
) -> list[ContentBlock]:

    _get_owned_page(db, page_id, owner_id)

    statement = (
        select(ContentBlock)
        .options(selectinload(ContentBlock.media))
        .where(ContentBlock.page_id == page_id)
        .order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc())
    )
    return list(db.scalars(statement).all())


# Cap nhat ContentBlock
def update_block(
    db: Session,
    page_id: int,
    block_id: int,
    owner_id: int,
    content: str | None = None,
    media_id: int | None = None,
    order_index: int | None = None,
    content_provided: bool = False,
    media_id_provided: bool = False,
    order_index_provided: bool = False
) -> ContentBlock:

    _get_owned_page(db, page_id, owner_id)

    block = db.scalar(
        select(ContentBlock)
        .options(selectinload(ContentBlock.media))
        .where(
            ContentBlock.id == block_id,
            ContentBlock.page_id == page_id
        )
    )
    if block is None:
        raise BlockNotFoundError("Khong tim thay ContentBlock.")

    if content_provided:
        if block.type == "video":
            try:
                block.content = validate_video_url(content)
            except ValueError as err:
                raise InvalidBlockDataError(str(err))
        else:
            block.content = content

    if media_id_provided:
        if media_id is not None:
            media = _validate_owned_media(db, media_id, owner_id)
            block.media_id = media.id
        else:
            if block.type == "image":
                raise InvalidBlockDataError(
                    "Image Block bat buoc phai co media_id hop le, khong duoc cap nhat media_id = null."
                )
            block.media_id = None

    if order_index_provided and order_index is not None:
        block.order_index = order_index

    try:
        db.commit()
        db.refresh(block)
        # Reload with media relationship
        refreshed = db.scalar(
            select(ContentBlock)
            .options(selectinload(ContentBlock.media))
            .where(ContentBlock.id == block.id)
        )
        return refreshed or block

    except Exception:
        db.rollback()
        raise


# Xoa ContentBlock
def delete_block(
    db: Session,
    page_id: int,
    block_id: int,
    owner_id: int
) -> None:

    _get_owned_page(db, page_id, owner_id)

    block = db.scalar(
        select(ContentBlock).where(
            ContentBlock.id == block_id,
            ContentBlock.page_id == page_id
        )
    )
    if block is None:
        raise BlockNotFoundError("Khong tim thay ContentBlock.")

    try:
        db.delete(block)
        db.commit()

    except Exception:
        db.rollback()
        raise


# Sap xep lai thu tu ContentBlock
def reorder_blocks(
    db: Session,
    page_id: int,
    owner_id: int,
    block_ids: list[int]
) -> list[ContentBlock]:

    _get_owned_page(db, page_id, owner_id)

    blocks = list(
        db.scalars(
            select(ContentBlock)
            .where(ContentBlock.page_id == page_id)
            .order_by(ContentBlock.order_index.asc(), ContentBlock.id.asc())
        ).all()
    )
    block_map = {block.id: block for block in blocks}

    for bid in block_ids:
        if bid not in block_map:
            raise BlockNotFoundError(
                f"Khong tim thay ContentBlock voi id={bid} trong Page nay."
            )

    seen: set[int] = set()
    ordered_ids: list[int] = []
    for bid in block_ids:
        if bid not in seen:
            seen.add(bid)
            ordered_ids.append(bid)

    for block in blocks:
        if block.id not in seen:
            ordered_ids.append(block.id)

    for index, bid in enumerate(ordered_ids):
        block_map[bid].order_index = index

    try:
        db.commit()
        return get_page_blocks(db, page_id, owner_id)

    except Exception:
        db.rollback()
        raise
