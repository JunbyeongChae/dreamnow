# TASKS — 배익거리 기업 홈페이지

각 Phase의 작업을 위에서부터 순서대로 진행하고, 완료 항목은 `DONE`으로 옮긴다.

- `[ ]` 예정 · `[~]` 진행 중 · `[x]` 완료(DONE으로 이동)

## 현재 Phase

Phase 0 — 프로젝트 셋업

---

## Phase 0 — 프로젝트 셋업

- [ ] `backend/`, `frontend/` 디렉토리 구조 생성 (TDD 4-1)
- [ ] `docker-compose.yml` 작성, MySQL 컨테이너 기동 확인 (TDD 9-3)
- [ ] `backend/.env.example` 작성 — `DATABASE_URL`, `JWT_SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGIN` (TDD 9-2)
- [ ] `backend/requirements.txt` 작성(FastAPI, SQLAlchemy, Alembic, PyMySQL, bcrypt 등) 및 `pip install`
- [ ] `frontend` package.json 초기화 (Vite + React + TypeScript)
- [ ] Tailwind CSS 설치, `tailwind.config.ts`에 05_design 2-2 컬러 토큰 등록
- [ ] frontend 의존성 설치: zustand, @tanstack/react-query, react-router, tiptap, lucide-react
- [ ] `backend/app/main.py` 기본 골격 + CORSMiddleware 설정 (TDD 9-1)

## Phase 1 — DB 설계

- [ ] `backend/app/database.py`: SQLAlchemy engine/session 싱글턴
- [ ] `backend/app/models.py`: User/Banner/Popup/Menu/Notice/Inquiry 모델 작성 (ERD 2장)
- [ ] Alembic 초기화 및 최초 마이그레이션 생성·적용
- [ ] `backend/app/schemas.py`: 각 API의 Pydantic 요청/응답 스키마 작성 (API 명세 API-01~11)

## Phase 2 — 인증

- [ ] `backend/app/auth.py`: `hash_password`/`verify_password`/`create_access_token` 구현 (TDD 8-1, 8-2)
- [ ] `require_auth` / `require_admin` 의존성 구현 (TDD 8-3)
- [ ] `backend/app/seed.py`: `ensure_admin_user` 구현, `main.py` startup 이벤트에 연결 (TDD 8-4)
- [ ] `backend/app/routers/auth.py`: `POST /api/auth/signup`, `POST /api/auth/login` (API-01, API-02)
- [ ] `frontend/src/store/authStore.ts`: user/token/isAdminMode 상태 + login/logout/toggleAdminMode (TDD 7-1, 6-7)

## Phase 3 — 백엔드 API 구현

- [ ] `backend/app/services/upload_service.py`: 확장자·크기 검증, UUID 파일명 저장 (TDD 6-3, 8-5)
- [ ] `backend/app/routers/uploads.py`: `POST /api/uploads`
- [ ] `backend/app/routers/banners.py`: 배너 GET/POST/PATCH/DELETE, 노출기간 스케줄링 (TDD 6-2)
- [ ] `backend/app/routers/popups.py`: 팝업 GET/POST/PATCH/DELETE
- [ ] `backend/app/routers/menus.py`: `GET /api/menus`(category/subCategory 검증), `GET /api/menus/{id}`, `POST /api/menus` (TDD 6-1)
- [ ] `backend/app/routers/notices.py`: 공지사항 GET(목록/상세)/POST
- [ ] `backend/app/routers/inquiries.py`: 상담글 작성/목록(role별 분기)/상세(소유자·관리자 검증)/답변 (TDD 6-4)
- [ ] Swagger UI로 API 11종(API 명세 API-01~11) 동작 확인

## Phase 4 — 프론트엔드 기반

- [ ] `frontend/src/router.tsx`: `/`, `/login`, `/signup`, `/about`, `/menu`, `/menu/:id`, `/support` 라우팅
- [ ] `frontend/src/api/`: `client.ts` + 도메인별 API 클라이언트(auth/banners/popups/menus/notices/inquiries)
- [ ] `frontend/src/hooks/useBreakpoint.ts` 구현 (TDD 6-5)
- [ ] `common/` 컴포넌트: Skeleton, ImageSlot, Button(5 variant), Badge(3 variant), ListRow, SectionHeader, FormInput, ImageUploader (05_design 5장·7장)
- [ ] `components/layout/Header.tsx`: 로그인 전/후/관리자모드 3상태 + 모바일 아코디언 드롭다운 (05_design 5-1, TDD 6-5~6-7)
- [ ] `components/layout/Footer.tsx`: 브레이크포인트별 전화번호 노출 분기 (05_design 5-2)
- [ ] 타이포그래피(Black Han Sans, Noto Sans KR) 폰트 로드 및 전역 스타일 적용 (05_design 3장)

## Phase 5 — 메인페이지

- [ ] `components/banner/BannerSlider.tsx`: 자동재생 + 호버 정지 + 좌우 화살표 + 점 인디케이터 (05_design 5-14)
- [ ] `components/popup/PopupModal.tsx`: 중앙 모달+딤, 체크박스+"오늘 하루 보지 않기"+X버튼 (05_design 5-13)
- [ ] `pages/MainPage.tsx`: 배너, 팝업, 퀵링크(QuickLinkCard, 브레이크포인트별 콘텐츠 축약) 조합 (05_design 5-10, 8-1)
- [ ] `components/admin/BannerForm.tsx`, `PopupForm.tsx`: 관리자 모드 인라인 등록/수정/삭제 폼

## Phase 6 — 로그인/회원가입

- [ ] `pages/LoginPage.tsx`, `SignupPage.tsx`: FormInput 재사용, 폼 카드 400px 반응형 (05_design 5-9)
- [ ] 로그인 성공 시 authStore 갱신 및 리다이렉트, 회원가입 성공 후 로그인 화면 이동
- [ ] 비로그인 접근 가드: 인증 필요 액션 시 `/login`으로 이동 (TDD 6-6)

## Phase 7 — 기업소개

- [ ] `pages/AboutPage.tsx`: 브랜드 스토리·연혁·매장 안내 섹션(정적 콘텐츠, TDD 3-1)
- [ ] 반응형 레이아웃: 이미지·텍스트 좌우/상하 배치 전환 (05_design 8-1)

## Phase 8 — 메뉴소개

- [ ] `components/menu/CategorySidebar.tsx`(태블릿·데스크톱 고정), `CategoryTabBar.tsx`(모바일 가로 스크롤 + 음료 하위탭 아코디언) (05_design 5-11)
- [ ] `components/menu/MenuCard.tsx`: 이미지+이름 카드, 그리드 2/3/4열 반응형
- [ ] `pages/MenuPage.tsx`: 카테고리 선택 → 목록 조회 연동
- [ ] `pages/MenuDetailPage.tsx`: 메뉴 상세(이미지·이름·가격·설명) 조회
- [ ] `components/admin/MenuForm.tsx`: 관리자 모드 메뉴 등록 폼(카테고리/하위카테고리 조건부 검증)

## Phase 9 — 고객센터

- [ ] `components/support/NoticeList.tsx`, `InquiryList.tsx`: ListRow 재사용, 날짜 표시 브레이크포인트 분기 (05_design 5-6)
- [ ] `components/support/InquiryDetail.tsx`: 답변대기/완료 Badge, 접근 권한(본인/관리자) 처리
- [ ] `pages/SupportPage.tsx`: 공지사항 목록/상세, 1:1 문의 작성/목록/상세 조합
- [ ] `components/admin/NoticeForm.tsx`(Tiptap), `InquiryAnswerForm.tsx`: 관리자 모드 등록/답변 폼

## Phase 10 — 통합 및 마무리

- [ ] 전 화면 반응형(375px/768px/1440px) 수동 QA (PRD 5-1, 05_design 8장)
- [ ] 빈 상태·에러 상태·로딩 상태 문구 전체 점검 (PRD 4장 각 화면 엣지 케이스)
- [ ] 보안 체크리스트 항목 점검 (CLAUDE.md 보안 체크리스트)
- [ ] README 작성, 로컬 실행 방법 정리

---

## DONE

(아직 없음)
