from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.exceptions import AppError
from app.models import User
from app.schemas import LoginRequest, LoginResponse, LoginUser, SignupRequest, SignupResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing is not None:
        raise AppError(409, "USERNAME_TAKEN", "이미 사용 중인 아이디입니다")

    user = User(username=body.username, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"success": True, "data": SignupResponse.model_validate(user).model_dump(by_alias=True)}


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise AppError(401, "INVALID_CREDENTIALS", "아이디 또는 비밀번호가 일치하지 않습니다")

    token = create_access_token(user.id, user.role.value)
    data = LoginResponse(token=token, user=LoginUser.model_validate(user))

    return {"success": True, "data": data.model_dump(by_alias=True)}
