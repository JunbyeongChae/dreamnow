from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.models import MenuCategory, MenuSubCategory, UserRole


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


# --- API-01. 회원가입 ---
class SignupRequest(CamelModel):
    username: str
    password: str


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


class PopupCreateResponse(CamelModel):
    id: int


# --- API-05. 메뉴 목록 조회 ---
class MenuListQuery(CamelModel):
    category: MenuCategory
    sub_category: MenuSubCategory | None = None


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
    category: MenuCategory
    sub_category: MenuSubCategory | None = None
    name: str
    image_url: str
    price: int
    description: str | None = None


class MenuCreateResponse(CamelModel):
    id: int


# --- API-08. 공지사항 목록 조회 ---
class NoticeListQuery(CamelModel):
    page: int = 1
    size: int = 10


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
