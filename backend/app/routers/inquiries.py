from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_admin, require_auth
from app.database import get_db
from app.exceptions import AppError
from app.models import Inquiry, User, UserRole
from app.schemas import (
    InquiryAnswerRequest,
    InquiryAnswerResponse,
    InquiryCreateRequest,
    InquiryCreateResponse,
    InquiryDetailResponse,
    InquiryListItem,
)

router = APIRouter(prefix="/api/inquiries", tags=["inquiries"])


@router.post("", status_code=201)
def create_inquiry(body: InquiryCreateRequest, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    if not body.title or not body.content:
        raise AppError(400, "INVALID_INPUT", "제목과 내용을 입력해주세요")

    inquiry = Inquiry(user_id=user.id, title=body.title, content=body.content)
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    return {"success": True, "data": InquiryCreateResponse.model_validate(inquiry).model_dump(by_alias=True)}


@router.get("")
def list_inquiries(db: Session = Depends(get_db), user: User = Depends(require_auth)):
    query = db.query(Inquiry)
    if user.role != UserRole.admin:
        query = query.filter(Inquiry.user_id == user.id)

    inquiries = query.order_by(Inquiry.created_at.desc(), Inquiry.id.desc()).all()
    data = [InquiryListItem.model_validate(inquiry).model_dump(by_alias=True) for inquiry in inquiries]
    return {"success": True, "data": data}


@router.get("/{inquiry_id}")
def get_inquiry(inquiry_id: int, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise AppError(404, "INQUIRY_NOT_FOUND", "존재하지 않는 상담글입니다")

    if user.role != UserRole.admin and inquiry.user_id != user.id:
        raise AppError(403, "FORBIDDEN", "본인 상담글만 조회할 수 있습니다")

    return {"success": True, "data": InquiryDetailResponse.model_validate(inquiry).model_dump(by_alias=True)}


@router.post("/{inquiry_id}/answer")
def answer_inquiry(
    inquiry_id: int,
    body: InquiryAnswerRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    inquiry = db.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise AppError(404, "INQUIRY_NOT_FOUND", "존재하지 않는 상담글입니다")

    if not body.answer_content:
        raise AppError(400, "INVALID_INPUT", "답변 내용을 입력해주세요")

    inquiry.answer_content = body.answer_content
    inquiry.answered_at = datetime.utcnow()
    db.commit()
    db.refresh(inquiry)

    return {"success": True, "data": InquiryAnswerResponse.model_validate(inquiry).model_dump(by_alias=True)}
