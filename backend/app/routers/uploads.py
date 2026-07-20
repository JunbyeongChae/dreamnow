from fastapi import APIRouter, Depends, File, UploadFile

from app.auth import require_admin
from app.models import User
from app.schemas import UploadResponse
from app.services.upload_service import save_upload_file

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("", status_code=201)
def upload_image(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    image_url = save_upload_file(file)
    return {"success": True, "data": UploadResponse(image_url=image_url).model_dump(by_alias=True)}
