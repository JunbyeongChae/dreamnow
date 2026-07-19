# 배익거리(配益居里) 기업 홈페이지 — CLAUDE.md

## 프로젝트 개요

오프라인 베이커리카페 배익거리의 브랜드를 신뢰감 있게 소개하고 메뉴 정보·공지사항·1:1 문의(상담글)를 제공하는 기업 홈페이지.   
방문객은 메인페이지·기업소개·메뉴소개·고객센터를 이용하고, 관리자는 별도 관리자 페이지 없이 각 화면에서 헤더의 "관리자 모드"를 켰을 때만 배너·팝업·메뉴·공지사항 등록과 상담글 답변을 처리한다.

- **기간**: 2026-07-19 ~ 2026-07-22 (3일, 개인 프로젝트)
- **배포**: 로컬 실행, 배포 없음 (Docker Compose로 MySQL만 구동, FastAPI/React는 로컬에서 직접 실행 — TDD 9-3)
- **DB**: MySQL (로컬 Docker Compose)

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 백엔드 프레임워크 | FastAPI (Python) |
| 프론트 프레임워크 | React + Vite (TypeScript) |
| 스타일 | Tailwind CSS (기본 브레이크포인트 `md`/`lg` 사용, 커스텀 브레이크포인트 없음) |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | Zustand |
| ORM | SQLAlchemy (+ Alembic 마이그레이션) |
| DB | MySQL (로컬 Docker Compose) |
| 인증 | JWT + bcrypt 직접 구현 (저장 위치: localStorage — TDD 8-2, OQ-01 참고) |
| 외부 API / AI | 없음 (AI 초안 작성 기능은 PRD 1-3에서 범위 제외됨) |
| Rich Text Editor | Tiptap (관리자 공지사항 작성용) |
| 아이콘 | lucide-react |
| 패키지 | npm (FE, `npm ci` 기본) / pip (BE, `requirements.txt` 버전 고정) |

---

## 핵심 아키텍처 원칙

이 프로젝트는 Next.js 풀스택 단일 앱이 아니라 **FastAPI 백엔드 + React·Vite 프론트엔드로 분리된 두 개의 앱**으로 구성된다(TDD 4-1 참고).

**절대 지켜야 할 규칙:**

1. **관리자 전용 API는 항상 서버에서 `role=admin`을 재검증한다.** 프론트엔드의 "관리자 모드 토글"(TDD 6-7)은 UI 편의일 뿐 보안 경계가 아니다 — `require_admin` 의존성이 매 요청마다 서버에서 검증한다.
2. **DB 접근은 SQLAlchemy ORM을 통해서만 수행한다.** DB 엔진/세션은 `backend/app/database.py`의 싱글턴으로 관리한다.
3. **업로드 파일은 원본 파일명을 신뢰하지 않는다.** 서버에서 UUID로 재생성한 이름으로만 저장한다(TDD 6-3, 8-5).
4. **비로그인 사용자의 인증 필요 액션은 서버가 항상 401로 재검증한다.** 프론트엔드 로그인 가드(TDD 6-6)는 UX 편의일 뿐이다.
5. **외부 API/AI 연동은 이 프로젝트 범위에 없다**(PRD Out of Scope). 향후 추가하더라도 반드시 서버 레이어에서만 호출하고 키는 서버 전용 환경변수로만 관리한다.

**환경변수 목록** (TDD 9-2 — 프론트엔드(Vite)에 노출되는 환경변수는 없다):

```bash
# backend/.env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/baeikgeori
JWT_SECRET_KEY=
ADMIN_USERNAME=admin       # 관리자 계정 시딩(TDD 8-4, ensure_admin_user)
ADMIN_PASSWORD=
CORS_ORIGIN=http://localhost:5173
```

---

## 폴더 구조

```
dreamnow/
├── backend/
│   ├── app/
│   │   ├── routers/                # auth / banners / popups / menus / notices / inquiries / uploads
│   │   ├── services/                # upload_service.py
│   │   ├── models.py                 # SQLAlchemy 모델 (User/Banner/Popup/Menu/Notice/Inquiry)
│   │   ├── schemas.py                # Pydantic 요청/응답 스키마
│   │   ├── auth.py                   # JWT/bcrypt, require_auth/require_admin
│   │   ├── database.py               # SQLAlchemy engine/session
│   │   ├── seed.py                   # 관리자 계정 시딩
│   │   └── main.py                   # FastAPI 엔트리포인트(CORS, StaticFiles)
│   ├── alembic/                      # DB 마이그레이션
│   ├── static/uploads/                # 업로드 이미지(.gitignore)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                    # MainPage/LoginPage/SignupPage/AboutPage/MenuPage/MenuDetailPage/SupportPage
│   │   ├── components/
│   │   │   ├── layout/               # Header, Footer
│   │   │   ├── banner/, popup/, menu/, support/
│   │   │   ├── admin/                # 관리자 모드에서만 렌더링되는 인라인 폼
│   │   │   └── common/               # ImageSlot/Button/Badge/ListRow/SectionHeader/FormInput 등
│   │   ├── hooks/useBreakpoint.ts
│   │   ├── store/authStore.ts        # 로그인 상태 + isAdminMode 토글
│   │   ├── api/                      # 도메인별 API 클라이언트
│   │   └── router.tsx / App.tsx / main.tsx
│   └── tailwind.config.ts
└── docker-compose.yml                # 로컬 MySQL 구동용
```

> 전체 파일 단위 구조와 각 파일의 역할은 [docs/02_TDD.md](docs/02_TDD.md) 4-1을 참고한다.

---

## API 응답 형식

모든 API(FastAPI 라우터)는 아래 형식을 따른다:

```json
// 성공
{ "success": true, "data": {} }

// 실패
{ "success": false, "error": { "code": "string", "message": "string" } }
```

---

## Git 관리 규칙

### 브랜치 전략 (GitHub Flow)

`main`은 항상 실행 가능한 상태. 작업 브랜치를 따로 만들어 작업 후 `main`에 병합.

```
main
└─ feature/작업명
└─ fix/작업명
└─ refactor/작업명
└─ style/작업명
└─ docs/작업명
└─ chore/작업명
```

**브랜치 네이밍:**

```
feature/login-page
fix/header-layout
refactor/button-component
style/main-layout
docs/readme-update
chore/project-setting
```

### Commit 메시지

```
type: 작업 내용
```

| Commit Type | 의미 |
|---|---|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `style` | UI/CSS 수정 |
| `docs` | 문서 수정 |
| `chore` | 설정 및 기타 작업 |

> 브랜치명에는 `feature`, 커밋 메시지에는 `feat` 사용 (Conventional Commits 관례).

**예시:**

```
feat: 로그인 페이지 구현
fix: 모바일 헤더 레이아웃 수정
refactor: Button 컴포넌트 구조 정리
chore: ESLint 설정 추가
```

### PR 규칙

**PR 제목:**

```
[type] 작업 제목
```

**PR 본문:** 작업 내용 / 확인 방법 / 스크린샷 또는 참고 자료

### 병합 전 셀프 체크리스트

- [ ] 의도한 작업을 모두 완료했는가
- [ ] `console.log`, 디버깅 코드, 불필요한 주석을 제거했는가
- [ ] 로컬에서 정상 동작을 직접 확인했는가
- [ ] UI 변경이 있다면 화면이 깨지지 않는가

### Merge 규칙

- 병합 방식: **Squash and merge** (main 히스토리를 깔끔하게 유지)
- 병합 후 작업 브랜치 삭제
- 충돌 발생 시 `rebase`로 해결 (Merge 커밋 없이 선형 히스토리 유지)

**충돌 해결 절차:**

```bash
git checkout main && git pull origin main
git checkout feature/작업명
git rebase main
# 충돌 파일 수정 후
git add .
git rebase --continue
git push origin feature/작업명 --force-with-lease
```

### 작업 흐름 요약

```
1. 최신 main pull
2. 작업 브랜치 생성
3. 작업 진행 + Commit 작성
4. 원격 브랜치 Push
5. PR 생성
6. 셀프 체크 후 main에 Squash merge
7. 작업 브랜치 삭제
```

---

## 코딩 규칙

- **주석 금지**: 이름만으로 의도가 명확하지 않을 때만 한 줄 추가. 무조건 주석 제거보다 필요한 경우 허용.
- **에러 처리**: 시스템 경계(외부 API, 사용자 입력)에서만 처리. 내부 코드는 신뢰.
- **컴포넌트 분리**: `common/`은 기능 독립적 재사용 UI. `features/`는 도메인별 컴포넌트.
- **타입 안정성**: 외부 API 응답은 반드시 `types/`에 명시적 타입 정의.
- **반응형**: 375px ~ 1440px 전 구간 정상 렌더링 (모바일/태블릿/데스크톱 3단계 브레이크포인트 — PRD 5-1).
- **시맨틱 HTML**: 접근성을 위해 시맨틱 태그 사용.
- **커밋 메시지 언어**: 한국어로 작성한다.

---

## 외부 API / AI 설정

이 프로젝트는 외부 API/AI 연동이 없다(PRD 1-3 비목표 — AI 초안 작성 기능은 범위에서 제외됨). 향후 외부 API를 추가하게 되면 이 섹션에 모델/버전과 호출 위치(반드시 서버 전용)를 명시한다.

---

## 세션 시작 루틴

새 대화가 시작되면 코드 작성 전에 아래 순서로 현재 상태를 파악하고 사용자에게 보고한다.

1. `TASKS.md` 읽기 → 현재 Phase와 TODO / 진행 중 항목 확인
2. `git status` + `git branch` 실행 → 현재 브랜치와 변경사항 확인
3. 아래 형식으로 상태 요약 후 "어디서부터 시작할까요?" 질문

```
## 현재 상태

- **Phase**: Phase X — 설명
- **브랜치**: feature/xxx (또는 main)
- **다음 작업**: TASKS.md 기준 첫 번째 TODO 항목

어디서부터 시작할까요?
```

---

## Git 액션 타이밍 규칙

Claude는 아래 시점에 Git 액션을 먼저 제안한다. 사용자가 수락하면 명령어를 실행한다.

| 시점 | 제안 내용 | 예시 |
|---|---|---|
| 새 작업을 시작하기 전 | 브랜치 생성 | `feature/xxx 브랜치를 만들까요?` |
| 작업 단위 하나가 완료됐을 때 | 커밋 | `feat: xxx 구현 으로 커밋할까요?` |
| 모든 작업이 완료되고 배포 준비가 됐을 때 | PR 생성 | `[feature] xxx 구현 으로 PR을 만들까요?` |
| PR이 머지된 후 | 브랜치 삭제 | `feature/xxx 브랜치를 삭제할까요?` |

**추가 원칙:**
- 브랜치 생성 전 항상 `main`의 최신 상태를 pull한다.
- 커밋 전 병합 전 셀프 체크리스트(console.log 제거, 로컬 동작 확인 등)를 함께 안내한다.
- PR 생성 시 제목과 본문 초안을 함께 제시한 뒤 컨펌을 받는다.

---

## 작업 진행 방식

모든 작업은 아래 순서를 반드시 따른다.

1. **계획 먼저**: 작업을 시작하기 전에 어떤 파일을 무엇을 어떤 방식으로 구현/수정할지, 그리고 그 방식을 선택한 이유(검토한 대안 대비)까지 상세히 텍스트로 제시한다.
2. **컨펌 대기**: 사용자가 확인("ㅇㅇ", "진행해", "ok" 등)을 주기 전까지 코드 작성을 시작하지 않는다.
3. **진행**: 컨펌 후 계획대로 구현한다.
4. **TASKS.md 업데이트**: 완료된 항목을 DONE으로 이동한다.

**계획 제시 형식 예시:**

```
## 작업 계획: feat/xxx

### 무엇을, 왜
- 목적/배경: {{이 작업을 하는 이유 — 어떤 요구사항·문제에서 비롯됐는지}}

### 파일별 구현 방식
1. `경로/파일1`
   - 구현/수정 내용: {{무엇을 어떤 방식으로 구현·수정하는지 구체적으로 — 함수/컴포넌트/API 단위}}
   - 선택 이유: {{이 방식을 고른 이유. 검토했던 대안이 있다면 비교}}
2. `경로/파일2`
   - 구현/수정 내용: {{...}}
   - 선택 이유: {{...}}
3. `경로/파일3`
   - 구현/수정 내용: {{...}}
   - 선택 이유: {{...}}

### 영향 범위 / 주의사항
- {{기존 기능·다른 파일에 미치는 영향, 테스트나 확인이 필요한 부분}}

진행할까요?
```

---

## 작업 추적 및 챌린지 기록 규칙

### TASKS.md 관리

`TASKS.md`는 현재 Phase의 작업 목록을 순서대로 관리한다. Claude는 아래 규칙에 따라 자동으로 업데이트한다.

- 작업을 시작할 때: `[ ]` → `[~]` (진행 중)
- 작업이 완료될 때: `[~]` → `[x]` + 해당 항목을 `DONE` 섹션으로 이동
- Phase가 전환될 때: 다음 Phase의 TODO 목록을 `TASKS.md`에 추가

### HISTORY.md 관리

`docs/HISTORY.md`는 완료된 작업에대한 작업 내용을 기록한다. Claude는 아래 상황을 반드시 준수한다.

- `TASKS.md`에서 작업이 `DONE` 섹션으로 이동한 후 작업내용을 자동으로 기록한다.
- 작업내용에는 작업일, 작업명, 작업이유, 작업내용을 상세히 기록한다.
- 다음 내용이 추가될 때는 작업순서에 맞게 시간순서대로 이전 기록의 뒷부분에 추가한다.

### CHALLENGES.md 관리

`docs/CHALLENGES.md`는 개발 중 막혔던 문제와 해결 과정을 기록한다. Claude는 아래 상황에서 자동으로 항목을 추가한다.

- 동일한 문제로 2회 이상 시도가 필요했던 경우
- 예상치 못한 에러나 외부 API 동작으로 설계를 변경한 경우
- 사용자가 "이거 챌린지로 기록해줘"라고 요청한 경우

**기록 형식:**

```markdown
## CH-XX. 제목

**날짜**: YYYY-MM-DD
**난이도**: 상 / 중 / 하

### Problem
무슨 문제가 발생했는가?

### Tried
어떤 것들을 시도했는가?

### Solution
최종적으로 어떻게 해결했는가?

### Lesson
이 경험에서 얻은 인사이트. 포트폴리오에서 강조할 포인트.
```

---

## 보안 체크리스트 (배포 전 반드시 확인)

- [ ] 서버 전용 값(DB 접속정보, `JWT_SECRET_KEY`, `ADMIN_PASSWORD`)이 프론트엔드(Vite)에 노출되지 않음
- [ ] `console.log`가 모두 제거됨
- [ ] 비밀번호가 bcrypt 해시로 저장됨 (평문 저장 금지 — TDD 8-1)
- [ ] 인증 토큰 저장 위치 확인 — 현재는 localStorage(TDD 8-2, OQ-01). httpOnly 쿠키 전환은 추후 개선 과제로 남겨둠
- [ ] 업로드 파일 확장자 화이트리스트(jpg/jpeg/png/gif/webp) + 5MB 크기 제한 + UUID 파일명 재생성 확인(TDD 8-5)
- [ ] 상담글 상세는 작성자 본인 또는 관리자만 접근 가능한지 확인(TDD 6-4)
- [ ] 공지사항 등 Rich Text 저장 전 HTML sanitize 처리 확인(TDD 11장 리스크)
- [ ] 관리자 전용 API가 프론트엔드의 "관리자 모드 토글" 여부와 무관하게 서버에서 `role=admin`을 재검증하는지 확인(TDD 6-7)
