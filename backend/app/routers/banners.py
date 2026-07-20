from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.exceptions import AppError
from app.models import Banner, User
from app.schemas import BannerCreateRequest, BannerCreateResponse, BannerResponse, BannerUpdateRequest

router = APIRouter(prefix="/api/banners", tags=["banners"])


@router.get("")
def list_banners(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    banners = (
        db.query(Banner)
        .filter(Banner.is_active.is_(True))
        .filter(or_(Banner.start_at.is_(None), Banner.start_at <= now))
        .filter(or_(Banner.end_at.is_(None), Banner.end_at >= now))
        .order_by(Banner.sort_order.asc())
        .all()
    )
    data = [BannerResponse.model_validate(banner).model_dump(by_alias=True) for banner in banners]
    return {"success": True, "data": data}


@router.post("", status_code=201)
def create_banner(body: BannerCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if not body.image_url:
        raise AppError(400, "INVALID_INPUT", "이미지 URL을 입력해주세요")

    banner = Banner(
        image_url=body.image_url,
        link_url=body.link_url,
        sort_order=body.sort_order,
        start_at=body.start_at,
        end_at=body.end_at,
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)

    return {"success": True, "data": BannerCreateResponse.model_validate(banner).model_dump(by_alias=True)}


@router.patch("/{banner_id}")
def update_banner(
    banner_id: int,
    body: BannerUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    banner = db.get(Banner, banner_id)
    if banner is None:
        raise AppError(404, "NOT_FOUND", "배너를 찾을 수 없습니다")

    updates = body.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(banner, field, value)

    db.commit()
    db.refresh(banner)

    return {"success": True, "data": {"id": banner.id}}


@router.delete("/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    banner = db.get(Banner, banner_id)
    if banner is None:
        raise AppError(404, "NOT_FOUND", "배너를 찾을 수 없습니다")

    db.delete(banner)
    db.commit()

    return {"success": True, "data": None}
