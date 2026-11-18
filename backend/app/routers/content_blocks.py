import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    status
)

from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db

from app.models.content_block import ContentBlock
from app.models.media import Media
from app.models.user import User

from app.schemas.page import PageBlockResponse
from app.schemas.content_block import (
    ActionSuccessResponse,
    BlockCreateRequest,
    BlockReorderRequest,
    BlockReorderResponse,
    BlockUpdateRequest,
)

from app.services.content_block_service import (
    create_block,
    delete_block,
    get_page_blocks,
    reorder_blocks,
    update_block,
    BlockNotFoundError,
    InvalidBlockDataError,
    MediaFileMissingError,
    MediaNotFoundError,
    PageNotFoundError,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/pages",
    tags=["ContentBlocks"]
)


def serialize_block(
    request: Request,
    block: ContentBlock,
    media: Media | None = None
) -> PageBlockResponse:
    resolved_media = media or block.media
    image_url = None
    original_filename = None
    mime_type = None
    size_bytes = None

    if block.type == "image" and resolved_media is not None:
        image_url = (
            str(request.base_url).rstrip("/")
            + "/"
            + resolved_media.file_path
        )
        original_filename = resolved_media.original_filename
        mime_type = resolved_media.mime_type
        size_bytes = resolved_media.size_bytes

    return PageBlockResponse(
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
        updated_at=block.updated_at,
    )


# API tao ContentBlock (text | image | video)
@router.post(
    "/{page_id}/blocks",
    response_model=PageBlockResponse,
    status_code=status.HTTP_201_CREATED
)
def create_block_api(
    page_id: int,
    request: Request,
    block_data: BlockCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        block, media = create_block(
            db=db,
            page_id=page_id,
            owner_id=current_user.id,
            block_type=block_data.type,
            content=block_data.content,
            media_id=block_data.media_id,
            order_index=block_data.order_index
        )
        return serialize_block(request, block, media)

    except PageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except MediaNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except MediaFileMissingError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )

    except InvalidBlockDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )


# API lay danh sach ContentBlock cua Page
@router.get(
    "/{page_id}/blocks",
    response_model=list[PageBlockResponse]
)
def list_page_blocks_api(
    page_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        blocks = get_page_blocks(
            db=db,
            page_id=page_id,
            owner_id=current_user.id
        )
        return [serialize_block(request, block) for block in blocks]

    except PageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


# API sap xep lai thu tu ContentBlock (dat TRUOC /{block_id} de tranh xung dot path)
@router.put(
    "/{page_id}/blocks/reorder",
    response_model=BlockReorderResponse
)
def reorder_blocks_api(
    page_id: int,
    request: Request,
    payload: BlockReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        blocks = reorder_blocks(
            db=db,
            page_id=page_id,
            owner_id=current_user.id,
            block_ids=payload.block_ids
        )
        return BlockReorderResponse(
            success=True,
            message="Cập nhật thứ tự thành công",
            blocks=[serialize_block(request, block) for block in blocks]
        )

    except (PageNotFoundError, BlockNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


# API cap nhat ContentBlock
@router.put(
    "/{page_id}/blocks/{block_id}",
    response_model=PageBlockResponse
)
def update_block_api(
    page_id: int,
    block_id: int,
    request: Request,
    block_data: BlockUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    fields_set = block_data.model_fields_set

    try:
        block = update_block(
            db=db,
            page_id=page_id,
            block_id=block_id,
            owner_id=current_user.id,
            content=block_data.content,
            media_id=block_data.media_id,
            order_index=block_data.order_index,
            content_provided="content" in fields_set,
            media_id_provided="media_id" in fields_set,
            order_index_provided="order_index" in fields_set
        )
        return serialize_block(request, block)

    except (PageNotFoundError, BlockNotFoundError, MediaNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )

    except MediaFileMissingError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error)
        )

    except InvalidBlockDataError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )


# API xoa ContentBlock
@router.delete(
    "/{page_id}/blocks/{block_id}",
    response_model=ActionSuccessResponse
)
def delete_block_api(
    page_id: int,
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        delete_block(
            db=db,
            page_id=page_id,
            block_id=block_id,
            owner_id=current_user.id
        )
        return ActionSuccessResponse(
            success=True,
            message="Đã xóa khối thành công"
        )

    except (PageNotFoundError, BlockNotFoundError) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )
