
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

from app.models.user import User

from app.schemas.content_block import (
    ImageBlockCreateRequest,
    ImageBlockResponse
)

from app.services.content_block_service import (
    create_image_block,
    PageNotFoundError,
    MediaNotFoundError,
    MediaFileMissingError
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/pages",
    tags=["ContentBlocks"]
)


# API tao Image Block
@router.post(
    "/{page_id}/blocks",
    response_model=ImageBlockResponse,
    status_code=status.HTTP_201_CREATED
)
def create_image_block_api(
    page_id: int,
    request: Request,
    block_data: ImageBlockCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # Tao Image Block
        block, media = create_image_block(
            db=db,
            page_id=page_id,
            owner_id=current_user.id,
            media_id=block_data.media_id,
            order_index=block_data.order_index
        )

        # Tao URL truy cap anh
        image_url = (
            str(request.base_url).rstrip("/")
            + "/"
            + media.file_path
        )

        # Tra ve thong tin Image Block
        return ImageBlockResponse(
            id=block.id,
            page_id=block.page_id,
            type="image",
            media_id=media.id,
            order_index=block.order_index,
            original_filename=media.original_filename,
            url=image_url,
            mime_type=media.mime_type,
            size_bytes=media.size_bytes,
            created_at=block.created_at,
            updated_at=block.updated_at
        )

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
