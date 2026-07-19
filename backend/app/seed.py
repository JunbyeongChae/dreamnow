import os

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.models import User, UserRole


def ensure_admin_user(db: Session) -> None:
    username = os.environ["ADMIN_USERNAME"]
    password = os.environ["ADMIN_PASSWORD"]

    existing = db.query(User).filter(User.username == username).first()
    if existing is not None:
        return

    admin = User(username=username, password_hash=hash_password(password), role=UserRole.admin)
    db.add(admin)
    db.commit()
