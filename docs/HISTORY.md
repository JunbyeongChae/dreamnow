# HISTORY — 배익거리 기업 홈페이지

작업 완료 내역을 시간순으로 기록한다.

---

## 2026-07-19 — Phase 0: 프로젝트 셋업

**작업이유**: FastAPI + React/Vite 분리 구조로 프로젝트를 시작하기 위한 최소 실행 환경(디렉토리 구조, DB, 의존성, 서버 골격)을 준비.

**작업내용**:
- `backend/`, `frontend/` 디렉토리 구조 생성 (TDD 4-1)
- `docker-compose.yml` 작성 — MySQL 8.0 컨테이너 정의. 로컬에 Windows 서비스(MySQL80)가 3306 포트를 이미 점유하고 있어 호스트 포트를 3307로 변경(`3307:3306`), `backend/.env`·`.env.example`의 `DATABASE_URL`도 3307로 함께 수정. `docker compose up -d` 및 `mysqladmin ping`으로 컨테이너 기동 확인 완료
- `backend/.env`, `.env.example` 작성 — `DATABASE_URL`, `JWT_SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGIN` (TDD 9-2)
- `backend/requirements.txt` 작성(fastapi, uvicorn, sqlalchemy, alembic, pymysql, bcrypt, pyjwt 등) 및 venv에 `pip install` 완료
- `frontend/package.json` 초기화(Vite + React + TypeScript) 및 zustand, @tanstack/react-query, react-router-dom, tiptap, lucide-react 의존성 설치
- Tailwind CSS 설치, `tailwind.config.ts`에 05_design 2-2 컬러 토큰(primary/accent/bg-warm 등) 등록
- `backend/app/main.py` 기본 골격 작성 — CORSMiddleware 설정(`CORS_ORIGIN` 환경변수 사용), `/api/health` 헬스체크 엔드포인트 포함 (TDD 9-1)
