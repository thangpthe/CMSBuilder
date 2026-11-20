
from pydantic import BaseModel, Field


# Du lieu Frontend gui khi dang nhap
class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


# Thong tin nguoi dung tra ve kem token
class UserAuthInfo(BaseModel):
    id: int
    username: str
    email: str | None = None
    role: str


# Du lieu Backend tra ve sau dang nhap
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAuthInfo | None = None
