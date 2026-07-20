import os
import uuid

from fastapi import UploadFile

from app.exceptions import AppError

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
CHUNK_SIZE = 1024 * 1024


def save_upload_file(file: UploadFile) -> str:
    extension = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise AppError(400, "INVALID_FILE_TYPE", "jpg, jpeg, png, gif, webp 파일만 업로드할 수 있습니다")

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}.{extension}"
    stored_path = os.path.join(UPLOAD_DIR, stored_filename)

    total_size = 0
    with open(stored_path, "wb") as out_file:
        while chunk := file.file.read(CHUNK_SIZE):
            total_size += len(chunk)
            if total_size > MAX_FILE_SIZE:
                out_file.close()
                os.remove(stored_path)
                raise AppError(400, "FILE_TOO_LARGE", "파일 크기는 5MB를 초과할 수 없습니다")
            out_file.write(chunk)

    return f"/static/uploads/{stored_filename}"
