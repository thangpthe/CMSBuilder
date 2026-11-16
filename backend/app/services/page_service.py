
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.page import Page
from app.models.content_block import ContentBlock
import re
import unicodedata

from datetime import datetime, timezone
# Tao Page moi
def create_page(
    db: Session,
    owner_id: int,
    title: str,
    description: str | None = None
) -> Page:

    new_page = Page(
        owner_id=owner_id,
        title=title.strip(),
        description=description.strip() if description else None,
        status="draft"
    )

    try:
        db.add(new_page)
        db.commit()
        db.refresh(new_page)

        return new_page

    except Exception:
        db.rollback()
        raise


# Lay danh sach Page cua User
def get_user_pages(
    db: Session,
    owner_id: int,
    skip: int = 0,
    limit: int = 20
) -> tuple[list[Page], int]:

    # Dem tong so Page cua User
    count_statement = (
        select(func.count())
        .select_from(Page)
        .where(Page.owner_id == owner_id)
    )

    total = db.scalar(count_statement) or 0

    # Lay danh sach Page
    statement = (
        select(Page)
        .where(Page.owner_id == owner_id)
        .order_by(
            Page.created_at.desc(),
            Page.id.desc()
        )
        .offset(skip)
        .limit(limit)
    )

    items = db.scalars(statement).all()

    return list(items), total



# Lay Page kem ContentBlock va Media lien quan
def get_user_page_by_id(
    db: Session,
    page_id: int,
    owner_id: int
) -> Page | None:

    statement = (
        select(Page)
        .options(
            selectinload(Page.content_blocks)
            .selectinload(ContentBlock.media)
        )
        .where(
            Page.id == page_id,
            Page.owner_id == owner_id
        )
    )

    return db.scalar(statement)


# Tao Slug tu tieu de Page
def generate_unique_slug(
    db: Session,
    title: str
) -> str:

    # Chuyen chu D co dau thanh D khong dau
    title = title.replace("đ", "d").replace("Đ", "D")

    # Loai bo dau tieng Viet
    normalized = unicodedata.normalize(
        "NFKD",
        title
    ).encode("ascii", "ignore").decode("ascii")

    # Chuyen thanh chu thuong va thay khoang trang bang dau -
    base_slug = re.sub(
        r"[^a-zA-Z0-9]+",
        "-",
        normalized.lower()
    ).strip("-")

    if not base_slug:
        base_slug = "page"

    slug = base_slug
    counter = 2

    # Kiem tra Slug co bi trung hay khong
    while db.scalar(
        select(Page.id).where(Page.slug == slug)
    ) is not None:

        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug

# Loi khi khong tim thay Page thuoc User
class PageNotFoundError(Exception):
    pass


# Publish Page
def publish_page(
    db: Session,
    page_id: int,
    owner_id: int
) -> Page:

    # Tim Page thuoc User hien tai
    statement = select(Page).where(
        Page.id == page_id,
        Page.owner_id == owner_id
    )

    page = db.scalar(statement)

    if page is None:
        raise PageNotFoundError(
            "Khong tim thay Page."
        )

    # Neu Page chua co Slug thi tao Slug moi
    if not page.slug:
        page.slug = generate_unique_slug(
            db,
            page.title
        )

    # Cap nhat trang thai xuat ban
    page.status = "published"

    # Ghi nhan thoi diem xuat ban lan dau
    if page.published_at is None:
        page.published_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(page)

        return page

    except Exception:
        db.rollback()
        raise


# Unpublish Page
def unpublish_page(
    db: Session,
    page_id: int,
    owner_id: int
) -> Page:

    statement = select(Page).where(
        Page.id == page_id,
        Page.owner_id == owner_id
    )

    page = db.scalar(statement)

    if page is None:
        raise PageNotFoundError(
            "Khong tim thay Page."
        )

    page.status = "draft"
    page.published_at = None

    try:
        db.commit()
        db.refresh(page)

        return page

    except Exception:
        db.rollback()
        raise

# Lay Page da Publish theo Slug
def get_published_page_by_slug(
    db: Session,
    slug: str
) -> Page | None:

    statement = (
        select(Page)
        .options(
            selectinload(Page.content_blocks)
            .selectinload(ContentBlock.media)
        )
        .where(
            Page.slug == slug,
            Page.status == "published"
        )
    )

    return db.scalar(statement)
