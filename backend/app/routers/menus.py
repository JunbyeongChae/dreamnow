from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.exceptions import AppError
from app.models import Menu, MenuCategory, MenuSubCategory, User
from app.schemas import MenuCreateRequest, MenuCreateResponse, MenuDetailResponse, MenuListItem, MenuUpdateRequest

router = APIRouter(prefix="/api/menus", tags=["menus"])


def _parse_category(category: str) -> MenuCategory:
    try:
        return MenuCategory(category)
    except ValueError:
        raise AppError(400, "INVALID_CATEGORY", "존재하지 않는 카테고리입니다")


def _parse_sub_category(sub_category: str | None) -> MenuSubCategory:
    if sub_category is None:
        raise AppError(400, "INVALID_SUB_CATEGORY", "음료 카테고리는 하위 카테고리를 선택해주세요")
    try:
        return MenuSubCategory(sub_category)
    except ValueError:
        raise AppError(400, "INVALID_SUB_CATEGORY", "음료 카테고리는 하위 카테고리를 선택해주세요")


def _validate_category_sub_category(category: MenuCategory, sub_category: str | None) -> MenuSubCategory | None:
    if category == MenuCategory.beverage:
        return _parse_sub_category(sub_category)
    if sub_category is not None:
        raise AppError(400, "INVALID_INPUT", "카테고리, 이름, 가격을 확인해주세요")
    return None


@router.get("")
def list_menus(
    category: str = Query(...),
    sub_category: str | None = Query(None, alias="subCategory"),
    db: Session = Depends(get_db),
):
    category_enum = _parse_category(category)

    query = db.query(Menu).filter(Menu.category == category_enum)
    if category_enum == MenuCategory.beverage:
        sub_category_enum = _parse_sub_category(sub_category)
        query = query.filter(Menu.sub_category == sub_category_enum)

    menus = query.order_by(Menu.id.asc()).all()
    data = [MenuListItem.model_validate(menu).model_dump(by_alias=True) for menu in menus]
    return {"success": True, "data": data}


@router.get("/{menu_id}")
def get_menu(menu_id: int, db: Session = Depends(get_db)):
    menu = db.get(Menu, menu_id)
    if menu is None:
        raise AppError(404, "MENU_NOT_FOUND", "존재하지 않는 메뉴입니다")

    return {"success": True, "data": MenuDetailResponse.model_validate(menu).model_dump(by_alias=True)}


@router.post("", status_code=201)
def create_menu(body: MenuCreateRequest, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    try:
        category_enum = MenuCategory(body.category)
    except ValueError:
        raise AppError(400, "INVALID_INPUT", "카테고리, 이름, 가격을 확인해주세요")

    sub_category_enum = _validate_category_sub_category(category_enum, body.sub_category)

    if not body.name or body.price is None:
        raise AppError(400, "INVALID_INPUT", "카테고리, 이름, 가격을 확인해주세요")

    menu = Menu(
        category=category_enum,
        sub_category=sub_category_enum,
        name=body.name,
        image_url=body.image_url,
        price=body.price,
        description=body.description,
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)

    return {"success": True, "data": MenuCreateResponse.model_validate(menu).model_dump(by_alias=True)}


@router.patch("/{menu_id}")
def update_menu(
    menu_id: int,
    body: MenuUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    menu = db.get(Menu, menu_id)
    if menu is None:
        raise AppError(404, "MENU_NOT_FOUND", "존재하지 않는 메뉴입니다")

    updates = body.model_dump(exclude_unset=True)

    category_value = updates.get("category", menu.category.value)
    sub_category_value = updates.get("sub_category", menu.sub_category.value if menu.sub_category else None)

    category_enum = _parse_category(category_value)
    sub_category_enum = _validate_category_sub_category(category_enum, sub_category_value)

    name = updates.get("name", menu.name)
    price = updates.get("price", menu.price)
    if not name or price is None:
        raise AppError(400, "INVALID_INPUT", "카테고리, 이름, 가격을 확인해주세요")

    menu.category = category_enum
    menu.sub_category = sub_category_enum
    menu.name = name
    menu.price = price
    if "image_url" in updates:
        menu.image_url = updates["image_url"]
    if "description" in updates:
        menu.description = updates["description"]

    db.commit()
    db.refresh(menu)

    return {"success": True, "data": {"id": menu.id}}


@router.delete("/{menu_id}")
def delete_menu(menu_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    menu = db.get(Menu, menu_id)
    if menu is None:
        raise AppError(404, "MENU_NOT_FOUND", "존재하지 않는 메뉴입니다")

    db.delete(menu)
    db.commit()

    return {"success": True, "data": None}
