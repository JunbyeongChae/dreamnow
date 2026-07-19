from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message


def _error_response(status_code: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"success": False, "error": {"code": code, "message": message}})


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return _error_response(exc.status_code, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        message = exc.errors()[0]["msg"] if exc.errors() else "잘못된 요청입니다"
        return _error_response(400, "INVALID_INPUT", message)

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception):
        return _error_response(500, "SERVER_ERROR", "잠시 후 다시 시도해주세요")
