from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator
from pydantic.alias_generators import to_camel

from app.models import MenuCategory, MenuSubCategory, UserRole


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# --- API-01. 회원가입 ---
class SignupRequest(CamelModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다")
        return value


class SignupResponse(CamelModel):
    id: int
    username: str


# --- API-02. 로그인 ---
class LoginRequest(CamelModel):
    username: str
    password: str


class LoginUser(CamelModel):
    id: int
    username: str
    role: UserRole


class LoginResponse(CamelModel):
    token: str
    user: LoginUser


# --- 이미지 업로드 ---
class UploadResponse(CamelModel):
    image_url: str


# --- API-03/04. 배너 ---
class BannerResponse(CamelModel):
    id: int
    image_url: str
    link_url: str | None
    sort_order: int


class BannerCreateRequest(CamelModel):
    image_url: str
    link_url: str | None = None
    sort_order: int = 0
    start_at: datetime | None = None
    end_at: datetime | None = None


class BannerUpdateRequest(CamelModel):
    image_url: str | None = None
    link_url: str | None = None
    sort_order: int | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    is_active: bool | None = None


class BannerCreateResponse(CamelModel):
    id: int


# --- 팝업 (배너와 동일 패턴) ---
class PopupResponse(CamelModel):
    id: int
    title: str
    content: str


class PopupCreateRequest(CamelModel):
    title: str
    content: str
    start_at: datetime | None = None
    end_at: datetime | None = None


class PopupUpdateRequest(CamelModel):
    title: str | None = None
    content: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    is_active: bool | None = None


class PopupCreateResponse(CamelModel):
    id: int


# --- API-05. 메뉴 목록 조회 ---
class MenuListItem(CamelModel):
    id: int
    name: str
    image_url: str


# --- API-06. 메뉴 상세 조회 ---
class MenuDetailResponse(CamelModel):
    id: int
    category: MenuCategory
    sub_category: MenuSubCategory | None
    name: str
    image_url: str
    price: int
    description: str | None


# --- API-07. 메뉴 등록 ---
class MenuCreateRequest(CamelModel):
    category: str
    sub_category: str | None = None
    name: str
    image_url: str
    price: int
    description: str | None = None


class MenuCreateResponse(CamelModel):
    id: int


class MenuUpdateRequest(CamelModel):
    category: str | None = None
    sub_category: str | None = None
    name: str | None = None
    image_url: str | None = None
    price: int | None = None
    description: str | None = None


# --- API-08. 공지사항 목록 조회 ---
class NoticeListItem(CamelModel):
    id: int
    title: str
    created_at: datetime


class NoticeListResponse(CamelModel):
    items: list[NoticeListItem]
    total: int
    page: int


class NoticeDetailResponse(CamelModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class NoticeCreateRequest(CamelModel):
    title: str
    content: str


class NoticeCreateResponse(CamelModel):
    id: int


# --- API-09. 상담글 작성 ---
class InquiryCreateRequest(CamelModel):
    title: str
    content: str


class InquiryCreateResponse(CamelModel):
    id: int


# --- 상담글 목록 조회 (role별 분기) ---
class InquiryListItem(CamelModel):
    id: int
    title: str
    answered_at: datetime | None
    created_at: datetime


# --- API-10. 상담글 상세 조회 ---
class InquiryDetailResponse(CamelModel):
    id: int
    user_id: int
    title: str
    content: str
    answer_content: str | None
    answered_at: datetime | None
    created_at: datetime


# --- API-11. 상담글 답변 등록 ---
class InquiryAnswerRequest(CamelModel):
    answer_content: str


class InquiryAnswerResponse(CamelModel):
    id: int
    answered_at: datetime
