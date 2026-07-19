import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.exceptions import register_exception_handlers
from app.routers import auth
from app.seed import ensure_admin_user

load_dotenv()

app = FastAPI(title="배익거리 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        ensure_admin_user(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"success": True, "data": {"status": "ok"}}
