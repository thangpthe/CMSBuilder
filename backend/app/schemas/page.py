
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


# Du lieu Frontend gui de tao Page
class PageCreateRequest(BaseModel):

    title: str = Field(min_length=1, max_length=255)

    description: str | None = Field(
        default=None,
        max_length=2000
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, value):
        value = value.strip()

        if not value:
            raise ValueError("Tieu de trang khong duoc de trong.")

        return value


# Response thong tin Page
class PageResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    title: str
    description: str | None
    slug: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None


# Response danh sach Page
class PageListResponse(BaseModel):

    items: list[PageResponse]
    total: int
    skip: int
    limit: int

# Thong tin tung ContentBlock trong Page
class PageBlockResponse(BaseModel):
    id: int
    page_id: int
    type: str
    content: str | None
    media_id: int | None
    order_index: int

    # Thong tin hinh anh (None neu khong phai Image Block)
    url: str | None = None
    original_filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None

    created_at: datetime
    updated_at: datetime


# Response Page kem danh sach ContentBlock
class PageDetailResponse(PageResponse):
    blocks: list[PageBlockResponse]

# Response cho Public Page
class PublicPageResponse(BaseModel):

    id: int
    title: str
    description: str | None
    slug: str
    status: str
    published_at: datetime | None

    # Danh sach ContentBlock
    blocks: list[PageBlockResponse]
