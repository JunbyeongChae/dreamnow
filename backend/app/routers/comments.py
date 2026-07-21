from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import require_auth
from app.database import get_db
from app.exceptions import AppError
from app.models import Comment, Notice, User, UserRole
from app.schemas import CommentCreateRequest, CommentResponse, CommentUpdateRequest

router = APIRouter(tags=["comments"])


def _to_response(comment: Comment) -> dict:
    return CommentResponse(
        id=comment.id,
        notice_id=comment.notice_id,
        user_id=comment.user_id,
        username=comment.user.username,
        content=comment.content,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    ).model_dump(by_alias=True)


@router.get("/api/notices/{notice_id}/comments")
def list_comments(notice_id: int, db: Session = Depends(get_db)):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise AppError(404, "NOTICE_NOT_FOUND", "존재하지 않는 공지사항입니다")

    comments = (
        db.query(Comment)
        .filter(Comment.notice_id == notice_id)
        .order_by(Comment.created_at.asc(), Comment.id.asc())
        .all()
    )
    return {"success": True, "data": [_to_response(comment) for comment in comments]}


@router.post("/api/notices/{notice_id}/comments", status_code=201)
def create_comment(
    notice_id: int,
    body: CommentCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    notice = db.get(Notice, notice_id)
    if notice is None:
        raise AppError(404, "NOTICE_NOT_FOUND", "존재하지 않는 공지사항입니다")

    if not body.content:
        raise AppError(400, "INVALID_INPUT", "댓글 내용을 입력해주세요")

    comment = Comment(notice_id=notice_id, user_id=user.id, content=body.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {"success": True, "data": _to_response(comment)}


@router.patch("/api/comments/{comment_id}")
def update_comment(
    comment_id: int,
    body: CommentUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_auth),
):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise AppError(404, "COMMENT_NOT_FOUND", "존재하지 않는 댓글입니다")

    if user.role != UserRole.admin and comment.user_id != user.id:
        raise AppError(403, "FORBIDDEN", "본인 댓글만 수정할 수 있습니다")

    if not body.content:
        raise AppError(400, "INVALID_INPUT", "댓글 내용을 입력해주세요")

    comment.content = body.content
    db.commit()
    db.refresh(comment)

    return {"success": True, "data": _to_response(comment)}


@router.delete("/api/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), user: User = Depends(require_auth)):
    comment = db.get(Comment, comment_id)
    if comment is None:
        raise AppError(404, "COMMENT_NOT_FOUND", "존재하지 않는 댓글입니다")

    if user.role != UserRole.admin and comment.user_id != user.id:
        raise AppError(403, "FORBIDDEN", "본인 댓글만 삭제할 수 있습니다")

    db.delete(comment)
    db.commit()

    return {"success": True, "data": None}
