
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# Du lieu Frontend gui de tao Image Block
class ImageBlockCreateRequest(BaseModel):

    media_id: int = Field(gt=0)

    order_index: int = Field(
        default=0,
        ge=0
    )


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
