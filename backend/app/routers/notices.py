from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.exceptions import AppError
from app.models import Notice, User
from app.schemas import NoticeCreateRequest, NoticeCreateResponse, NoticeDetailResponse, NoticeListItem, NoticeListResponse

router = APIRouter(prefix="/api/notices", tags=["notices"])


@router.get("")
def list_notices(page: int = Query(1), size: int = Query(10), db: Session = Depends(get_db)):
    if page < 1 or size < 1 or size > 100:
        raise AppError(400, "INVALID_QUERY", "잘못된 페이지 값입니다")

    total = db.query(Notice).count()
    notices = (
        db.query(Notice)
        .order_by(Notice.created_at.desc(), Notice.id.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    items = [NoticeListItem.model_validate(notice) for notice in notices]
    data = NoticeListResponse(items=items, total=total, page=page)

    return {"success": True, "data": data.model_dump(by_alias=True)}


@router.get("/{notice_id}")
def get_notice(notice_id: int, db: Session = Depends(get_db)):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise AppError(404, "NOTICE_NOT_FOUND", "존재하지 않는 공지사항입니다")

    return {"success": True, "data": NoticeDetailResponse.model_validate(notice).model_dump(by_alias=True)}


@router.post("", status_code=201)
def create_notice(body: NoticeCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not body.title or not body.content:
        raise AppError(400, "INVALID_INPUT", "제목과 내용을 입력해주세요")

    notice = Notice(title=body.title, content=body.content)
    db.add(notice)
    db.commit()
    db.refresh(notice)

    return {"success": True, "data": NoticeCreateResponse.model_validate(notice).model_dump(by_alias=True)}
