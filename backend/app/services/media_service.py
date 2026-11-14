
import logging
import tempfile
import uuid
import warnings

from dataclasses import dataclass
from pathlib import Path

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session
from sqlalchemy import func, select
from app.models.media import Media


# Khoi tao Logger
logger = logging.getLogger(__name__)


# Xac dinh thu muc Backend
BACKEND_DIR = Path(__file__).resolve().parents[2]

# Thu muc luu tru hinh anh
UPLOAD_DIR = BACKEND_DIR / "uploads" / "images"

# Dung luong toi da: 10 MB
MAX_FILE_SIZE = 10 * 1024 * 1024

# Moi lan doc toi da 1 MB
CHUNK_SIZE = 1024 * 1024


# Cac phan mo rong duoc chap nhan
ALLOWED_EXTENSIONS = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".webp": "WEBP"
}


# Dinh dang anh sang phan mo rong luu tru
FORMAT_EXTENSIONS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp"
}


# Dinh dang anh sang MIME type
FORMAT_MIME_TYPES = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp"
}


# Loi khi file anh khong hop le
class ImageValidationError(Exception):
    pass


# Thong tin file sau khi duoc luu
@dataclass(frozen=True)
class StoredImageInfo:
    original_filename: str
    stored_filename: str
    file_path: str
    mime_type: str
    size_bytes: int


# Lam sach ten file ban dau
def clean_filename(filename: str | None) -> str:

    if not filename:
        raise ImageValidationError("Ten file khong hop le.")

    # Loai bo duong dan, chi giu ten file
    filename = filename.replace("\\", "/").split("/")[-1].strip()

    # Loai bo ky tu dieu khien
    filename = "".join(
        character for character in filename
        if character.isprintable()
    )

    if not filename or filename in {".", ".."}:
        raise ImageValidationError("Ten file khong hop le.")

    if len(filename) > 255:
        raise ImageValidationError("Ten file qua dai.")

    return filename


# Luu file anh vao thu muc Backend
async def store_image_file(
    upload_file: UploadFile
) -> StoredImageInfo:

    original_filename = clean_filename(upload_file.filename)

    # Lay phan mo rong
    extension = Path(original_filename).suffix.lower()

    # Kiem tra phan mo rong
    expected_format = ALLOWED_EXTENSIONS.get(extension)

    if expected_format is None:
        raise ImageValidationError(
            "Chi chap nhan JPG, JPEG, PNG va WEBP."
        )

    # Tao thu muc neu chua ton tai
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    temp_path = None

    try:
        # Tao file tam de tiep nhan du lieu
        with tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=".upload-",
            suffix=".tmp",
            dir=UPLOAD_DIR,
            delete=False
        ) as temp_file:

            temp_path = Path(temp_file.name)

            total_size = 0

            # Dua con tro file ve dau
            await upload_file.seek(0)

            # Doc file theo tung phan nho
            while True:

                chunk = await upload_file.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                # Dung khi vuot qua 10 MB
                if total_size > MAX_FILE_SIZE:
                    raise ImageValidationError(
                        "Dung luong hinh anh vuot qua 10 MB."
                    )

                temp_file.write(chunk)

        if total_size == 0:
            raise ImageValidationError(
                "File hinh anh khong duoc de trong."
            )

        # Kiem tra noi dung hinh anh bang Pillow
        try:
            with warnings.catch_warnings():

                # Chan anh co kich thuoc giai nen bat thuong
                warnings.simplefilter(
                    "error",
                    Image.DecompressionBombWarning
                )

                # Mo va kiem tra cau truc file
                with Image.open(temp_path) as image:

                    actual_format = image.format
                    image.verify()

                # Mo lai va kiem tra kha nang doc du lieu anh
                with Image.open(temp_path) as image:
                    image.load()

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning
        ) as error:

            raise ImageValidationError(
                "File tai len khong phai hinh anh hop le."
            ) from error

        # Kiem tra dinh dang thuc te
        if actual_format not in FORMAT_EXTENSIONS:
            raise ImageValidationError(
                "Dinh dang hinh anh khong duoc ho tro."
            )

        # Kiem tra ten file co khop noi dung anh khong
        if actual_format != expected_format:
            raise ImageValidationError(
                "Phan mo rong khong khop voi noi dung hinh anh."
            )

        # Tao ten file moi bang UUID
        new_extension = FORMAT_EXTENSIONS[actual_format]

        stored_filename = f"{uuid.uuid4().hex}{new_extension}"

        destination_path = UPLOAD_DIR / stored_filename

        # Kiem tra ten file moi co bi trung hay khong
        while destination_path.exists():

            stored_filename = (
                f"{uuid.uuid4().hex}{new_extension}"
            )

            destination_path = UPLOAD_DIR / stored_filename

        # Chuyen file tam thanh file chinh thuc
        temp_path.replace(destination_path)

        # Danh dau file tam da duoc chuyen
        temp_path = None

        # Luu duong dan tuong doi
        relative_path = (
            Path("uploads") / "images" / stored_filename
        ).as_posix()

        # Tra ve thong tin file
        return StoredImageInfo(
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=relative_path,
            mime_type=FORMAT_MIME_TYPES[actual_format],
            size_bytes=total_size
        )

    finally:

        # Xoa file tam neu co loi xay ra
        if temp_path is not None and temp_path.exists():
            temp_path.unlink()


# Xoa file da luu khi can huy thao tac
def delete_stored_image(file_path: str) -> None:

    # Chuyen duong dan tuong doi thanh duong dan tuyet doi
    absolute_path = (BACKEND_DIR / file_path).resolve()

    upload_root = UPLOAD_DIR.resolve()

    # Dam bao chi xoa file nam trong thu muc uploads/images
    try:
        absolute_path.relative_to(upload_root)

    except ValueError as error:
        raise ValueError(
            "Duong dan file nam ngoai thu muc upload."
        ) from error

    if absolute_path.is_file():
        absolute_path.unlink()


# Upload anh va luu thong tin vao Database
async def upload_image(
    db: Session,
    owner_id: int,
    upload_file: UploadFile
) -> Media:

    # Luu file truoc
    stored_image = await store_image_file(upload_file)

    # Tao ban ghi Media
    new_media = Media(
        owner_id=owner_id,
        original_filename=stored_image.original_filename,
        stored_filename=stored_image.stored_filename,
        file_path=stored_image.file_path,
        mime_type=stored_image.mime_type,
        size_bytes=stored_image.size_bytes
    )

    try:

        db.add(new_media)

        # Gui du lieu xuong Database nhung chua commit
        db.flush()

        # Lay cac gia tri do Database tao ra
        db.refresh(new_media)

        # Xac nhan luu du lieu
        db.commit()

        return new_media

    except Exception:

        # Huy giao dich Database neu co loi
        db.rollback()

        # Xoa file da luu neu Database khong luu duoc
        try:
            delete_stored_image(stored_image.file_path)

        except OSError:
            logger.exception(
                "Khong the xoa file anh sau khi luu Database that bai."
            )

        raise

# Lay danh sach Media cua mot User
def get_user_media(
    db: Session,
    owner_id: int,
    skip: int = 0,
    limit: int = 20
) -> tuple[list[Media], int]:

    # Dem tong so anh cua User
    count_statement = (
        select(func.count())
        .select_from(Media)
        .where(Media.owner_id == owner_id)
    )

    total = db.scalar(count_statement) or 0

    # Lay danh sach anh theo trang
    statement = (
        select(Media)
        .where(Media.owner_id == owner_id)
        .order_by(
            Media.created_at.desc(),
            Media.id.desc()
        )
        .offset(skip)
        .limit(limit)
    )

    items = db.scalars(statement).all()

    return list(items), total


# Lay mot Media theo ID va User so huu
def get_user_media_by_id(
    db: Session,
    media_id: int,
    owner_id: int
) -> Media | None:

    statement = select(Media).where(
        Media.id == media_id,
        Media.owner_id == owner_id
    )

    return db.scalar(statement)
