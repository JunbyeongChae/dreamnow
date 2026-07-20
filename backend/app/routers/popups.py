from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.exceptions import AppError
from app.models import Popup, User
from app.schemas import PopupCreateRequest, PopupCreateResponse, PopupResponse, PopupUpdateRequest

router = APIRouter(prefix="/api/popups", tags=["popups"])


@router.get("")
def list_popups(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    popups = (
        db.query(Popup)
        .filter(Popup.is_active.is_(True))
        .filter(or_(Popup.start_at.is_(None), Popup.start_at <= now))
        .filter(or_(Popup.end_at.is_(None), Popup.end_at >= now))
        .order_by(Popup.id.asc())
        .all()
    )
    data = [PopupResponse.model_validate(popup).model_dump(by_alias=True) for popup in popups]
    return {"success": True, "data": data}


@router.post("", status_code=201)
def create_popup(body: PopupCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not body.title:
        raise AppError(400, "INVALID_INPUT", "제목을 입력해주세요")
    if not body.content:
        raise AppError(400, "INVALID_INPUT", "내용을 입력해주세요")

    popup = Popup(
        title=body.title,
        content=body.content,
        start_at=body.start_at,
        end_at=body.end_at,
    )
    db.add(popup)
    db.commit()
    db.refresh(popup)

    return {"success": True, "data": PopupCreateResponse.model_validate(popup).model_dump(by_alias=True)}


@router.patch("/{popup_id}")
def update_popup(
    popup_id: int,
    body: PopupUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    popup = db.get(Popup, popup_id)
    if popup is None:
        raise AppError(404, "NOT_FOUND", "팝업을 찾을 수 없습니다")

    updates = body.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(popup, field, value)

    db.commit()
    db.refresh(popup)

    return {"success": True, "data": {"id": popup.id}}


@router.delete("/{popup_id}")
def delete_popup(popup_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    popup = db.get(Popup, popup_id)
    if popup is None:
        raise AppError(404, "NOT_FOUND", "팝업을 찾을 수 없습니다")

    db.delete(popup)
    db.commit()

    return {"success": True, "data": None}
