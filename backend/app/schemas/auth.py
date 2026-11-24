
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


USERNAME_REGEX = re.compile(r"^[A-Za-z0-9_.-]+\Z")
EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+\Z")


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


# Du lieu Frontend gui khi dang ky tai khoan
class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    username: str
    email: str | None = None
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        """Trim and validate username format and length."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Tên đăng nhập không được để trống.")
        if len(cleaned) < 3 or len(cleaned) > 100:
            raise ValueError("Tên đăng nhập phải từ 3 đến 100 ký tự.")
        if not USERNAME_REGEX.match(cleaned):
            raise ValueError(
                "Tên đăng nhập chỉ được chứa chữ cái, chữ số, dấu chấm, gạch dưới hoặc gạch ngang."
            )
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        """Normalize optional email to None when blank, otherwise strip, lowercase, and validate."""
        if value is None:
            return None
        cleaned = value.strip().lower()
        if not cleaned:
            return None
        if len(cleaned) > 255:
            raise ValueError("Email không được vượt quá 255 ký tự.")
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Địa chỉ email không hợp lệ.")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """Validate required password presence and length."""
        if not value or not value.strip():
            raise ValueError("Mật khẩu không được để trống.")
        if len(value) < 6:
            raise ValueError("Mật khẩu phải có ít nhất 6 ký tự.")
        if len(value) > 128:
            raise ValueError("Mật khẩu không được vượt quá 128 ký tự.")
        return value


# Du lieu Backend tra ve sau khi dang ky
class RegisterResponse(BaseModel):
    message: str
    user: UserAuthInfo
