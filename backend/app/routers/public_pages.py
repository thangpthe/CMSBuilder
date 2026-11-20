
import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    status
)

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.page import (
    PageBlockResponse,
    PublicPageResponse,
    PublicPageSummaryResponse,
    PublicPageListResponse,
)

from app.services.page_service import (
    get_published_page_by_slug,
    get_all_published_pages,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/public/pages",
    tags=["Public Pages"]
)


# Tao URL truy cap hinh anh
def build_public_media_url(
    request: Request,
    media
) -> str:

    return (
        str(request.base_url).rstrip("/")
        + "/"
        + media.file_path
    )


# API lay danh sach tat ca cac Page da Publish tu toan bo nguoi dung
@router.get(
    "",
    response_model=PublicPageListResponse,
    summary="Lay danh sach tat ca cac trang da xuat ban cua toan bo nguoi dung"
)
def list_public_pages_api(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    pages, total = get_all_published_pages(
        db=db,
        skip=skip,
        limit=limit
    )

    items = [
        PublicPageSummaryResponse(
            id=page.id,
            title=page.title,
            description=page.description,
            slug=page.slug or f"page-{page.id}",
            status=page.status,
            published_at=page.published_at,
            author_name=page.owner.username if page.owner else "Tác giả",
            blocks_count=len(page.content_blocks) if page.content_blocks else 0
        )
        for page in pages
    ]

    return PublicPageListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


# API lay Public Page theo Slug
@router.get(
    "/{slug}",
    response_model=PublicPageResponse
)
def get_public_page_api(
    slug: str,
    request: Request,
    db: Session = Depends(get_db)
):

    # Tim Page da Publish
    page = get_published_page_by_slug(
        db=db,
        slug=slug
    )

    # Page khong ton tai hoac chua Publish
    if page is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khong tim thay Public Page."
        )

    # Chuan bi danh sach ContentBlock
    blocks_response = []

    for block in page.content_blocks:

        # Mac dinh thong tin Media la None
        image_url = None
        original_filename = None
        mime_type = None
        size_bytes = None

        # Neu la Image Block
        if block.type == "image" and block.media is not None:

            media = block.media

            image_url = build_public_media_url(
                request,
                media
            )

            original_filename = media.original_filename
            mime_type = media.mime_type
            size_bytes = media.size_bytes

        # Tao response cho tung Block
        block_response = PageBlockResponse(
            id=block.id,
            page_id=block.page_id,
            type=block.type,
            content=block.content,
            media_id=block.media_id,
            order_index=block.order_index,
            url=image_url,
            original_filename=original_filename,
            mime_type=mime_type,
            size_bytes=size_bytes,
            created_at=block.created_at,
            updated_at=block.updated_at
        )

        blocks_response.append(block_response)

    # Tra ve Public Page
    return PublicPageResponse(
        id=page.id,
        title=page.title,
        description=page.description,
        slug=page.slug or slug,
        status=page.status,
        published_at=page.published_at,
        author_name=page.owner.username if page.owner else "CMSBuilder",
        blocks=blocks_response
    )
