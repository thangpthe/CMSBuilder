
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    status
)

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User

from app.schemas.page import (
    PageCreateRequest,
    PageResponse,
    PageListResponse,
    PageDetailResponse,
    PageBlockResponse
)

from app.services.page_service import (
    create_page,
    get_user_pages,
    get_user_page_by_id,
    publish_page,
    unpublish_page,
    PageNotFoundError
)


router = APIRouter(
    prefix="/api/pages",
    tags=["Pages"]
)

# Tao URL truy cap Media
def build_media_url(request: Request, media) -> str:

    return (
        str(request.base_url).rstrip("/")
        + "/"
        + media.file_path
    )

# API tao Page
@router.post(
    "",
    response_model=PageResponse,
    status_code=status.HTTP_201_CREATED
)
def create_page_api(
    page_data: PageCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    return create_page(
        db=db,
        owner_id=current_user.id,
        title=page_data.title,
        description=page_data.description
    )


# API lay danh sach Page
@router.get(
    "",
    response_model=PageListResponse
)
def list_pages_api(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    items, total = get_user_pages(
        db=db,
        owner_id=current_user.id,
        skip=skip,
        limit=limit
    )

    return PageListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


# API lay Page kem danh sach ContentBlock
@router.get(
    "/{page_id}",
    response_model=PageDetailResponse
)
def get_page_detail_api(
    page_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Lay Page cua User hien tai
    page = get_user_page_by_id(
        db=db,
        page_id=page_id,
        owner_id=current_user.id
    )

    # Khong tim thay Page hoac khong co quyen truy cap
    if page is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khong tim thay Page."
        )

    # Chuan bi danh sach ContentBlock
    blocks_response = []

    for block in page.content_blocks:

        image_url = None
        original_filename = None
        mime_type = None
        size_bytes = None

        # Neu la Image Block va co Media
        if block.type == "image" and block.media is not None:

            media = block.media

            image_url = build_media_url(
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

    # Tra ve Page kem ContentBlock
    return PageDetailResponse(
        id=page.id,
        owner_id=page.owner_id,
        title=page.title,
        description=page.description,
        slug=page.slug,
        status=page.status,
        created_at=page.created_at,
        updated_at=page.updated_at,
        published_at=page.published_at,
        blocks=blocks_response
    )

# API Publish Page
@router.post(
    "/{page_id}/publish",
    response_model=PageResponse
)
def publish_page_api(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        page = publish_page(
            db=db,
            page_id=page_id,
            owner_id=current_user.id
        )

        return page

    except PageNotFoundError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

# API Unpublish Page
@router.post(
    "/{page_id}/unpublish",
    response_model=PageResponse
)
def unpublish_page_api(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        page = unpublish_page(
            db=db,
            page_id=page_id,
            owner_id=current_user.id
        )

        return page

    except PageNotFoundError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )



