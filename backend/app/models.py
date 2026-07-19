import enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class MenuCategory(str, enum.Enum):
    season = "season"
    beverage = "beverage"
    dessert = "dessert"


class MenuSubCategory(str, enum.Enum):
    coffee = "coffee"
    non_coffee = "non_coffee"
    tea = "tea"
    ade_juice = "ade_juice"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.user, index=True)
    created_at: Mapped["DateTime"] = mapped_column(DateTime, nullable=False, server_default=func.now())

    inquiries: Mapped[list["Inquiry"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Banner(Base):
    __tablename__ = "banners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    link_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    start_at: Mapped["DateTime | None"] = mapped_column(DateTime, nullable=True)
    end_at: Mapped["DateTime | None"] = mapped_column(DateTime, nullable=True)


class Popup(Base):
    __tablename__ = "popups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    start_at: Mapped["DateTime | None"] = mapped_column(DateTime, nullable=True)
    end_at: Mapped["DateTime | None"] = mapped_column(DateTime, nullable=True)


class Menu(Base):
    __tablename__ = "menus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[MenuCategory] = mapped_column(Enum(MenuCategory), nullable=False, index=True)
    sub_category: Mapped[MenuSubCategory | None] = mapped_column(Enum(MenuSubCategory), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped["DateTime"] = mapped_column(DateTime, nullable=False, server_default=func.now())


class Notice(Base):
    __tablename__ = "notices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped["DateTime"] = mapped_column(DateTime, nullable=False, server_default=func.now(), index=True)
    updated_at: Mapped["DateTime"] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    answer_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    answered_at: Mapped["DateTime | None"] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped["DateTime"] = mapped_column(DateTime, nullable=False, server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="inquiries")
