from datetime import datetime
import re
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, Field, model_validator

from app.schemas.page import PageBlockResponse


VIDEO_HOST_REGEX = re.compile(
    r"(^|\.)(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)$",
    re.IGNORECASE,
)
VIDEO_EXT_REGEX = re.compile(r"\.(mp4|webm|ogg)$", re.IGNORECASE)


def validate_video_url(value: str | None) -> str:
    url = (value or "").strip()
    if not url or len(url) > 1000:
        raise ValueError(
            "URL video không hợp lệ. Vui lòng nhập link YouTube, Vimeo hoặc file MP4."
        )

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(
            "URL video không hợp lệ. Vui lòng nhập link YouTube, Vimeo hoặc file MP4."
        )

    host = (parsed.hostname or "").lower()
    path = (parsed.path or "").lower()
    if not (VIDEO_HOST_REGEX.search(host) or VIDEO_EXT_REGEX.search(path)):
        raise ValueError(
            "URL video không hợp lệ. Vui lòng nhập link YouTube, Vimeo hoặc file MP4."
        )

    return url


# Du lieu Frontend gui de tao Image Block (tuong thich nguoc)
class ImageBlockCreateRequest(BaseModel):

    media_id: int = Field(gt=0)

    order_index: int = Field(
        default=0,
        ge=0
    )


# Du lieu Frontend gui de tao ContentBlock (text | image | video)
class BlockCreateRequest(BaseModel):

    type: Literal["text", "image", "video"] = "image"
    content: str | None = None
    media_id: int | None = Field(default=None, gt=0)
    order_index: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_block_payload(self) -> "BlockCreateRequest":
        if self.type == "image":
            if self.media_id is None:
                raise ValueError("media_id la bat buoc doi voi Image Block.")
        elif self.type == "video":
            self.content = validate_video_url(self.content)
        elif self.type == "text":
            if self.content is None:
                self.content = ""
        return self


# Du lieu Frontend gui de cap nhat ContentBlock
class BlockUpdateRequest(BaseModel):

    content: str | None = None
    media_id: int | None = Field(default=None, gt=0)
    order_index: int | None = Field(default=None, ge=0)


# Du lieu Frontend gui de sap xep lai thu tu ContentBlock
class BlockReorderRequest(BaseModel):

    block_ids: list[int] = Field(min_length=1)


# Response chung cho thao tac xoa / cap nhat thanh cong
class ActionSuccessResponse(BaseModel):

    success: bool = True
    message: str


class BlockReorderResponse(ActionSuccessResponse):

    blocks: list[PageBlockResponse] = []


# PB-03: Du lieu Frontend gui de dong bo toan bo Block trong mot transaction
class BulkSyncBlockItem(BaseModel):

    id: int | None = None  # None = tao moi, co gia tri = cap nhat
    type: Literal["text", "image", "video"] = "text"
    content: str | None = None
    media_id: int | None = Field(default=None, gt=0)
    order_index: int = Field(default=0, ge=0)


class BulkSyncBlocksRequest(BaseModel):

    blocks: list[BulkSyncBlockItem] = Field(default_factory=list)


class BulkSyncBlocksResponse(ActionSuccessResponse):

    blocks: list[PageBlockResponse] = []


# Du lieu Backend tra ve sau khi tao Image Block
class ImageBlockResponse(BaseModel):

    id: int
    page_id: int
    type: Literal["image"]
    media_id: int
    order_index: int

    original_filename: str
    url: str
    mime_type: str
    size_bytes: int

    created_at: datetime
    updated_at: datetime
