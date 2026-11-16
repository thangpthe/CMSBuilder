
import logging

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    UploadFile,
    status
)

from sqlalchemy.orm import Session
from fastapi import Query
from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.media import MediaUploadResponse
from app.services.media_service import (
    ImageValidationError,
    upload_image
)
from app.schemas.media import (
    MediaUploadResponse,
    MediaResponse,
    MediaListResponse
)
from app.services.media_service import (
    ImageValidationError,
    upload_image,
    get_user_media,
    get_user_media_by_id
)

# Khoi tao Logger
logger = logging.getLogger(__name__)

# Khoi tao Router
router = APIRouter(
    prefix="/api/media",
    tags=["Media"]
)


# Tao URL truy cap hinh anh
def build_media_url(request: Request, media) -> str:

    return (
        str(request.base_url).rstrip("/")
        + "/"
        + media.file_path
    )


# API lay danh sach hinh anh
@router.get(
    "",
    response_model=MediaListResponse
)
def list_media(
    request: Request,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Lay danh sach Media cua User hien tai
    items, total = get_user_media(
        db=db,
        owner_id=current_user.id,
        skip=skip,
        limit=limit
    )

    # Tao response cho tung hinh anh
    media_items = [
        MediaResponse(
            id=item.id,
            original_filename=item.original_filename,
            stored_filename=item.stored_filename,
            url=build_media_url(request, item),
            mime_type=item.mime_type,
            size_bytes=item.size_bytes,
            created_at=item.created_at
        )
        for item in items
    ]

    return MediaListResponse(
        items=media_items,
        total=total,
        skip=skip,
        limit=limit
    )


# API lay thong tin chi tiet mot hinh anh
@router.get(
    "/{media_id}",
    response_model=MediaResponse
)
def get_media_detail(
    media_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Tim anh theo ID va nguoi so huu
    media = get_user_media_by_id(
        db=db,
        media_id=media_id,
        owner_id=current_user.id
    )

    # Khong tim thay hoac khong co quyen truy cap
    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Khong tim thay hinh anh."
        )

    return MediaResponse(
        id=media.id,
        original_filename=media.original_filename,
        stored_filename=media.stored_filename,
        url=build_media_url(request, media),
        mime_type=media.mime_type,
        size_bytes=media.size_bytes,
        created_at=media.created_at
    )


# API Upload hinh anh
@router.post(
    "/upload",
    response_model=MediaUploadResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_image_api(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        # Luu anh va thong tin vao Database
        media = await upload_image(
            db=db,
            owner_id=current_user.id,
            upload_file=file
        )

        # Tao URL truy cap hinh anh
        image_url = (
            str(request.base_url).rstrip("/")
            + "/"
            + media.file_path
        )

        # Tra ve thong tin anh
        return MediaUploadResponse(
            id=media.id,
            original_filename=media.original_filename,
            stored_filename=media.stored_filename,
            url=image_url,
            mime_type=media.mime_type,
            size_bytes=media.size_bytes
        )

    except ImageValidationError as error:

        # Loi khi file khong hop le
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except Exception:

        # Ghi loi vao log cua Backend
        logger.exception("Image upload failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Khong the tai hinh anh len he thong."
        )

    finally:

        # Dong file sau khi xu ly
        await file.close()
