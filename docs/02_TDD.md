# TDD(Technical Design Document) — 배익거리(配益居里) 기업 홈페이지

**문서 버전**: v0.11
**작성자**: Nathan
**최초 작성일**: 2026-07-19
**최종 수정일**: 2026-07-19
**참조 PRD**: v0.6
**상태**: [ ] 초안 / [x] 진행 중 / [ ] 완료

---

## 0. 문서 목적

이 문서는 **배익거리 기업 홈페이지**의 기술 구현 방법을 정의한다.
PRD에서 요구하는 기능을 **어떻게** 구현할지, 기술 스택 선택 이유, 시스템 아키텍처, DB 설계, API 설계, 폴더 구조, 그리고 주요 기술 결정 사항을 기록한다.

> v0.3에서는 PRD v0.2 변경(AI 초안 기능 제거, 화면 구성을 메인페이지·로그인/회원가입·기업소개·메뉴소개·고객센터로 재편, 별도 관리자 페이지 폐지 후 각 화면에 역할 기반 관리 권한을 인라인 배치)을 반영했다.
> v0.4에서는 메뉴 카테고리 구조를 재정의했다 — 음료는 상위 카테고리이며 coffee/non-coffee/tea/ade·주스는 그 하위 상세 카테고리다(기존에는 6개를 평면 ENUM으로 처리).
> v0.5에서는 PRD v0.4의 모바일/태블릿/데스크톱 반응형 브레이크포인트 요구사항을 반영해 Tailwind 브레이크포인트 전략(6-5)을 추가했다.
> v0.6에서는 4장 폴더 구조를 파일 단위까지 확장한 프로젝트 파일트리로 보강했다.
> v0.7에서는 [05_design.md](05_design.md)(목업 분석 기반 디자인 시스템 문서) 7장의 제안을 반영해 4-1 파일트리에 공통 컴포넌트 6종과 `CategoryTabBar.tsx`를 추가했다.
> v0.8에서는 05_design.md의 OQ-D01(모바일 헤더 패널) 논의 결과를 반영했다 — 모바일 헤더는 드롭다운(아코디언)/네비 3항목만/로그인 링크 없음으로 확정하고, 비로그인 접근 가드 흐름(6-6)을 신설했다.
> v0.9에서는 OQ-D02(아이콘 라이브러리) 논의 결과를 반영해 2장 기술 스택에 `lucide-react`를 추가했다.
> v0.10에서는 OQ-D08 논의 결과를 반영했다 — 헤더가 로그인 전/후/관리자모드 3가지 상태를 가지며, 관리자도 별도 토글을 켜야 등록/답변 버튼이 보이는 "관리자 모드 토글"(6-7)을 신설했다.
> v0.11에서는 문서 전체 재검토 중 발견한 표현 오류를 수정했다 — 6-5에서 관리자 로그인 가능 범위를 "데스크톱(`lg:` 이상)"으로 좁게 썼던 것을 PRD 3장·05_design 5-1과 같은 범위인 "태블릿·데스크톱(`md:` 이상)"으로 정정하고, 메뉴 등록 플로우(1-2)에 관리자 모드 토글 언급을 추가했다. 변경 내역은 13장 참고.

---

## 1. 시스템 아키텍처 개요

### 1-1. 전체 구조

```
[브라우저 (Client, Vite dev server :5173)]
      │
      │ HTTP Request (REST, CORS 허용 필요)
      ▼
[FastAPI 서버 :8000]
  ├── [라우팅 / 컨트롤러 레이어 — routers/]
  ├── [서비스 레이어 — services/]
  ├── [정적 파일 서빙 — /static/uploads (StaticFiles)]
  └── [DB 접근 레이어]
      │                          │
      │ SQLAlchemy ORM           │ 로컬 디스크 저장
      ▼                          ▼
[MySQL]                  [backend/static/uploads]
```

**핵심 원칙**

- 관리자 전용 기능(배너/팝업 관리, 메뉴 등록, 상담글 답변)은 별도 관리자 페이지 없이 각 도메인 화면(메인페이지, 메뉴소개, 고객센터)에 인라인으로 노출한다. 프론트엔드는 `role` 값으로 UI 노출 여부만 분기하며, 최종 권한 검증은 항상 서버에서 수행한다.
- 관리자 전용 API는 인증 미들웨어에서 `role=admin`을 확인한 뒤에만 처리한다.
- 업로드된 파일은 원본 파일명을 신뢰하지 않고 서버에서 재생성한 이름(UUID)으로만 저장한다.

---

### 1-2. 핵심 요청 흐름

**로그인 플로우**

```
① 사용자가 아이디/비밀번호 입력 후 로그인 클릭
      │
② 클라이언트에서 API 호출 — POST /api/auth/login
      │
③ 서버에서 처리
   ├── 아이디로 사용자 조회
   └── bcrypt로 비밀번호 검증
      │
④ JWT 발급(role 포함) 반환
      │
⑤ 클라이언트가 토큰 저장 후 인증 상태로 전환, role에 따라 각 화면의 관리자 전용 UI(등록 버튼 등) 노출
```

**메뉴 카테고리별 조회 플로우**

```
① 사용자가 메뉴소개 화면 진입, 사이드바에서 상위 카테고리(시즌메뉴/음료/디저트) 선택
      │  ※ 음료를 선택하면 하위 카테고리(coffee/non-coffee/tea/ade·주스)가 펼쳐지고, 그중 하나를 선택
      │
② 클라이언트에서 API 호출 — GET /api/menus?category={category}&subCategory={subCategory}
      │  (subCategory는 category=beverage일 때만 전달)
      │
③ 서버에서 처리 — category 값 검증, category=beverage인 경우 subCategory 필수값 검증 후 해당 카테고리의 메뉴를 조회
      │
④ 메뉴 카드(이미지 + 이름) 목록 반환
      │
⑤ 카드 클릭 시 GET /api/menus/{id} 호출 → 이미지·이름·가격·설명이 포함된 상세 화면 노출
```

**메뉴 등록 플로우 (관리자)**

```
① 관리자가 로그인 후 헤더의 관리자 모드를 켠 상태에서 메뉴소개 화면 내 "메뉴 등록" 버튼 클릭(6-7)
      │
② 클라이언트에서 API 호출 — POST /api/menus (상위 카테고리·하위 카테고리·이미지·이름·가격·설명)
      │
③ 서버에서 처리
   ├── role=admin 검증 (아니면 403)
   └── 요청 값 검증(category는 season/beverage/dessert 중 하나, category=beverage인 경우 subCategory는 coffee/non_coffee/tea/ade_juice 중 하나가 필수, 그 외 카테고리에서는 subCategory를 무시)
      │
④ 등록 결과 반환 후 클라이언트가 해당 카테고리 목록을 갱신
```

**상담글 작성 및 답변 플로우**

```
① 로그인 사용자가 고객센터에서 상담글(제목/내용) 작성 — POST /api/inquiries
      │
② 서버에 저장, 작성자 본인만 상세 조회 가능(다른 사용자는 403)
      │
③ 관리자가 고객센터에서 전체 상담글 목록 조회 — GET /api/inquiries (role=admin이면 전체, 아니면 본인 것만 반환)
      │
④ 관리자가 상담글 상세 진입 후 답변 작성 — POST /api/inquiries/{id}/answer
      │
⑤ 서버가 answerContent와 answeredAt을 저장, 목록에서 해당 글이 "답변완료" 상태로 전환
```

**이미지 업로드 플로우** (배너/팝업/메뉴/공지사항 등록 공용)

```
① 관리자(로그인 상태)가 이미지 파일 선택
      │
② 클라이언트에서 API 호출 — POST /api/uploads (multipart/form-data)
      │
③ 서버에서 처리
   ├── 확장자 화이트리스트 검증(jpg, jpeg, png, gif, webp)
   ├── 파일 크기 검증(5MB 이하)
   ├── UUID 파일명으로 재생성 후 backend/static/uploads/ 에 저장
      │
④ 저장된 파일의 접근 URL 반환 — { "url": "/static/uploads/{uuid}.png" }
      │
⑤ 클라이언트가 반환된 URL을 배너/팝업/메뉴/공지 등록 폼에 사용
```

---

## 2. 기술 스택

| 분류 | 기술 | 버전 기준 | 선택 이유 |
|---|---|---|---|
| 백엔드 프레임워크 | FastAPI | 프로젝트 시작 시 lock 파일 기준 확정 | 과제 지정 스택, 비동기 처리와 자동 문서화(Swagger) 지원 |
| 프론트 프레임워크 | React + Vite | lock 파일 기준 확정 | 과제 지정 스택, 빠른 개발 서버 구동 |
| 언어 | TypeScript | lock 파일 기준 확정 | 컴파일 단계에서 타입 오류를 잡아 개발 속도와 안정성 확보 |
| 스타일 | Tailwind CSS | lock 파일 기준 확정 | 과제 지정 스택, 반응형 레이아웃을 빠르게 구현 |
| 상태 관리 | Zustand | lock 파일 기준 확정 | 로그인 상태 등 단순 전역 상태에 적합, 러닝커브 낮음 |
| 서버 상태 관리 | TanStack Query | lock 파일 기준 확정 | 배너/팝업/메뉴/공지/상담글 등 서버 데이터의 캐싱·재요청을 단순화 |
| ORM | SQLAlchemy | lock 파일 기준 확정 | FastAPI와 궁합이 좋은 표준 ORM, Alembic으로 마이그레이션 관리 |
| 데이터베이스 | MySQL | 사용 환경 기준 확정 | 과제 지정 스택 |
| Rich Text Editor | Tiptap | lock 파일 기준 확정 | 관리자가 공지사항 본문을 작성할 때 사용, HTML 출력 형식이 백엔드 저장 방식과 맞음 |
| 아이콘 | `lucide-react` | lock 파일 기준 확정 | 목업은 인라인 SVG로 그려졌지만, 일관된 스타일의 아이콘을 패키지로 관리하면 유지보수가 쉽고 아이콘 종류도 풍부해 확장에 유리(05_design 5-10, OQ-D02 해소) |
| 인증 | JWT + bcrypt 직접 구현 | lock 파일 기준 확정 | 아이디/비밀번호 기반 인증만 필요한 범위에 적합, 단순하게 시작 |
| 비밀번호 해싱 라이브러리 | `bcrypt` 패키지 직접 사용 (passlib 미사용) | `bcrypt==4.*` | passlib은 최신 bcrypt(4.1+)와 `__about__` 속성 문제로 충돌 이력이 있어, 이번 프로젝트에서는 passlib 없이 `bcrypt.hashpw`/`bcrypt.checkpw`를 직접 사용해 버전 충돌 리스크를 없앤다 |
| 파일 저장 | 로컬 디스크 (`backend/static/uploads/`) | — | 배포 불필요·단일 서버 환경이므로 S3 등 외부 스토리지 도입은 과함. FastAPI `StaticFiles`로 직접 서빙 |
| 배포 | 로컬 실행 (Docker Compose) | — | 과제 요구사항상 서버 배포 불필요, 로컬 재현성 확보 목적으로 Docker Compose(MySQL)만 구성 |
| 패키지 매니저 | npm (FE) / pip (BE) | 팀 합의 후 고정 | 단일 개발자 프로젝트, 표준 도구 사용 |

### 2-1. 패키지 설치 및 버전 관리 원칙

이 프로젝트는 개발 환경 차이를 줄이기 위해 **lock 파일 기준 설치**를 원칙으로 한다.

### 프론트엔드 (npm)

```bash
npm ci
```

- `package-lock.json`을 기준으로 의존성을 설치한다.
- 패키지를 추가하거나 제거한 경우 `package.json`과 `package-lock.json`을 함께 커밋한다.

### 백엔드 (pip)

```bash
pip install -r requirements.txt
```

- `requirements.txt`에 버전을 고정(`==`)하여 명시한다.
- `bcrypt`는 `passlib`을 거치지 않고 직접 import하므로, `passlib`은 `requirements.txt`에서 제외한다.

---

## 3. 데이터 설계

### 3-1. 데이터 소스

| 종류 | 설명 | 위치 / 키 |
|---|---|---|
| 데이터베이스 | 회원, 배너, 팝업, 메뉴, 공지사항, 상담글 데이터 | MySQL |
| 로컬 파일 | 배너/팝업/메뉴/공지사항에 사용되는 이미지 원본 | `backend/static/uploads/` |

> 기업소개(`/about`) 화면은 변경 빈도가 낮은 브랜드 스토리·매장 안내로 구성되어 있어, DB 테이블이나 API 없이 프론트엔드 정적 콘텐츠로 구현한다(10장 결정 사항 참고).

---

### 3-2. 핵심 데이터 스키마

### User

```json
{
  "id": "int",
  "username": "string",
  "password_hash": "string",
  "role": "user | admin",
  "createdAt": "string"
}
```

### Banner

```json
{
  "id": "int",
  "imageUrl": "string",
  "linkUrl": "string",
  "isActive": "boolean",
  "sortOrder": "int",
  "startAt": "string",
  "endAt": "string"
}
```

### Popup

```json
{
  "id": "int",
  "title": "string",
  "content": "string",
  "isActive": "boolean",
  "startAt": "string",
  "endAt": "string"
}
```

### Menu

```json
{
  "id": "int",
  "category": "season | beverage | dessert",
  "subCategory": "coffee | non_coffee | tea | ade_juice | null",
  "name": "string",
  "imageUrl": "string",
  "price": "int",
  "description": "string",
  "createdAt": "string"
}
```

> `subCategory`는 `category`가 `beverage`일 때만 값을 가진다(coffee/non_coffee/tea/ade_juice 중 하나). 시즌메뉴·디저트는 하위 카테고리가 없으므로 `null`이다.

### Notice

```json
{
  "id": "int",
  "title": "string",
  "content": "string (HTML)",
  "createdAt": "string",
  "updatedAt": "string"
}
```

> PRD 4-5(US-14, v0.3)에 명시된 대로 관리자가 고객센터 화면에서 공지사항을 인라인으로 등록한다. 배너/팝업/메뉴와 동일한 패턴이다.

### Inquiry

```json
{
  "id": "int",
  "userId": "int",
  "title": "string",
  "content": "string",
  "answerContent": "string | null",
  "answeredAt": "string | null",
  "createdAt": "string"
}
```

> 답변 상태(답변대기/답변완료)는 별도 컬럼 없이 `answeredAt`의 null 여부로 판단한다. 상담글 1건당 답변은 최대 1개이므로 별도 answers 테이블을 두지 않는다.

---

### 3-3. ORM Schema

이 프로젝트는 SQLAlchemy를 사용하므로 Prisma 대신 SQLAlchemy 모델로 작성한다.

```python
# models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

class MenuCategoryEnum(str, enum.Enum):
    season = "season"
    beverage = "beverage"
    dessert = "dessert"

class MenuSubCategoryEnum(str, enum.Enum):
    coffee = "coffee"
    non_coffee = "non_coffee"
    tea = "tea"
    ade_juice = "ade_juice"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    created_at = Column(DateTime, server_default="now()")

class Banner(Base):
    __tablename__ = "banners"
    id = Column(Integer, primary_key=True)
    image_url = Column(String(255), nullable=False)
    link_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    start_at = Column(DateTime, nullable=True)
    end_at = Column(DateTime, nullable=True)

class Popup(Base):
    __tablename__ = "popups"
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    start_at = Column(DateTime, nullable=True)
    end_at = Column(DateTime, nullable=True)

class Menu(Base):
    __tablename__ = "menus"
    id = Column(Integer, primary_key=True)
    category = Column(Enum(MenuCategoryEnum), nullable=False, index=True)
    sub_category = Column(Enum(MenuSubCategoryEnum), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    image_url = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default="now()")

class Notice(Base):
    __tablename__ = "notices"
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default="now()")
    updated_at = Column(DateTime, server_default="now()", onupdate="now()")

class Inquiry(Base):
    __tablename__ = "inquiries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    answer_content = Column(Text, nullable=True)
    answered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default="now()")
    user = relationship("User")
```

> 업로드 파일은 DB에 별도 테이블을 두지 않는다. 파일은 디스크에 저장하고, 그 경로(URL)만 `banners.image_url` / `popups.content` / `menus.image_url` / `notices.content` 안에 문자열로 참조된다.

---

### 3-4. 주요 함수 목록

| 함수명 | 동작 | 입력 | 반환 |
|---|---|---|---|
| `hash_password` | 비밀번호를 bcrypt로 해싱 | `password: str` | `str` |
| `verify_password` | 입력 비밀번호와 해시 비교 | `password: str, hash: str` | `bool` |
| `create_access_token` | JWT 토큰 생성 | `user_id: int, role: str` | `str` |
| `require_auth` | 로그인 여부 검증 (토큰 파싱) | `token: str` | `User` (실패 시 401) |
| `require_admin` | 관리자 권한 검증 미들웨어 | `token: str` | `User` (실패 시 403) |
| `list_menus_by_category` | 카테고리(및 음료 하위 카테고리)별 메뉴 목록 조회 | `category: str, sub_category: str \| None` | `list[Menu]` |
| `create_menu` | 신규 메뉴 등록(관리자) | `category, sub_category, name, image_url, price, description` | `Menu` |
| `create_inquiry` | 상담글 작성 | `user_id: int, title: str, content: str` | `Inquiry` |
| `list_inquiries` | 상담글 목록 조회(본인 또는 전체) | `user: User` | `list[Inquiry]` |
| `get_inquiry` | 상담글 상세 조회(소유자/관리자 검증 포함) | `inquiry_id: int, user: User` | `Inquiry` (권한 없으면 403) |
| `answer_inquiry` | 상담글 답변 등록(관리자) | `inquiry_id: int, answer_content: str` | `Inquiry` |
| `save_uploaded_file` | 업로드 파일 검증(확장자/크기) 후 UUID로 저장 | `file: UploadFile` | `str (저장된 파일 URL)` |
| `ensure_admin_user` | 서버 기동 시 관리자 계정 존재 여부 확인 후 없으면 생성 | 없음 (환경변수 `ADMIN_USERNAME`/`ADMIN_PASSWORD` 사용) | 없음 |

---

### 3-5. DB 설계 결정 사항

| 결정 | 이유 |
|---|---|
| User 테이블에 soft delete 미적용 | MVP 범위에서 탈퇴 계정 복구가 불필요하므로 hard delete로 단순 처리 |
| PK 타입을 Auto Increment(정수)로 선택 | 단일 서버·소규모 트래픽 환경이라 분산 환경 고려가 불필요, 조회 성능과 구현 단순성 우선 |
| 메뉴 카테고리를 `category`(상위)+`sub_category`(하위, nullable) 두 컬럼으로 표현 | 시즌메뉴·음료·디저트는 상위 카테고리이고, coffee/non-coffee/tea/ade·주스는 음료에만 속하는 실제 하위 카테고리라는 비대칭 구조. 단일 평면 ENUM으로는 이 상하위 관계를 표현할 수 없어 두 컬럼으로 분리했다. `sub_category`는 `category='beverage'`일 때만 값을 가지며 그 외에는 NULL이다 |
| 상담글 답변을 별도 테이블이 아닌 `inquiries` 테이블 컬럼으로 저장 | 상담글 1건당 답변은 최대 1개(1:1)이므로 별도 answers 테이블을 두는 것이 과함 |
| 업로드 파일을 위한 별도 테이블 미도입 | 파일은 디스크에만 저장하고 URL 문자열만 참조하면 충분한 규모, 파일 메타데이터 관리가 필요할 만큼 요구사항이 크지 않음 |

---

## 4. 폴더 구조

이 프로젝트는 **프론트엔드/백엔드 분리 구조**로 구현한다.

### 4-1. 프로젝트 파일트리

```
dreamnow/
├── backend/
│   ├── app/
│   │   ├── routers/                      # 도메인별 API 라우터
│   │   │   ├── auth.py                   # 회원가입/로그인
│   │   │   ├── banners.py                # 배너 조회/등록/수정/삭제
│   │   │   ├── popups.py                 # 팝업 조회/등록/수정/삭제
│   │   │   ├── menus.py                  # 메뉴 목록(카테고리)/상세/등록
│   │   │   ├── notices.py                # 공지사항 목록/상세/등록
│   │   │   ├── inquiries.py              # 상담글 작성/목록/상세/답변
│   │   │   └── uploads.py                # 이미지 업로드
│   │   ├── services/                     # 비즈니스 로직
│   │   │   └── upload_service.py         # 확장자·크기 검증, UUID 파일명 저장
│   │   ├── models.py                     # SQLAlchemy 모델(User/Banner/Popup/Menu/Notice/Inquiry)
│   │   ├── schemas.py                    # Pydantic 요청/응답 스키마
│   │   ├── auth.py                       # JWT 발급·검증, bcrypt 해싱, require_auth/require_admin
│   │   ├── database.py                   # SQLAlchemy engine/session, Base
│   │   ├── seed.py                       # 관리자 계정 시딩(ensure_admin_user)
│   │   └── main.py                       # FastAPI 엔트리포인트(CORS, StaticFiles, 라우터 등록)
│   ├── alembic/                          # DB 마이그레이션(2장 ORM 각주 참고)
│   │   ├── versions/
│   │   └── env.py
│   ├── static/
│   │   └── uploads/                      # 업로드 이미지 저장 위치 (.gitkeep, 실제 파일은 git 제외)
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                        # 라우트 단위 페이지
│   │   │   ├── MainPage.tsx              # `/`
│   │   │   ├── LoginPage.tsx             # `/login`
│   │   │   ├── SignupPage.tsx            # `/signup`
│   │   │   ├── AboutPage.tsx             # `/about`
│   │   │   ├── MenuPage.tsx              # `/menu`
│   │   │   ├── MenuDetailPage.tsx        # `/menu/:id`
│   │   │   └── SupportPage.tsx           # `/support`
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx            # 로그인 전/후/관리자모드 3상태 렌더링, 모바일은 아코디언 드롭다운(6-5, 6-7)
│   │   │   │   └── Footer.tsx
│   │   │   ├── banner/
│   │   │   │   └── BannerSlider.tsx
│   │   │   ├── popup/
│   │   │   │   └── PopupModal.tsx        # "오늘 하루 보지 않기" 처리
│   │   │   ├── menu/
│   │   │   │   ├── CategorySidebar.tsx   # 시즌메뉴/음료(하위)/디저트, 태블릿·데스크톱 좌측 고정
│   │   │   │   ├── CategoryTabBar.tsx    # 모바일 전용 가로 스크롤 탭바(05_design 5-11/8-2)
│   │   │   │   └── MenuCard.tsx
│   │   │   ├── support/
│   │   │   │   ├── NoticeList.tsx
│   │   │   │   ├── InquiryList.tsx
│   │   │   │   └── InquiryDetail.tsx     # 답변대기/답변완료 상태 뱃지
│   │   │   ├── admin/                    # 역할 기반으로 각 페이지에 인라인 노출되는 관리자 전용 폼
│   │   │   │   ├── BannerForm.tsx
│   │   │   │   ├── PopupForm.tsx
│   │   │   │   ├── MenuForm.tsx
│   │   │   │   ├── NoticeForm.tsx        # Tiptap 기반 리치 텍스트 입력
│   │   │   │   └── InquiryAnswerForm.tsx
│   │   │   └── common/
│   │   │       ├── Skeleton.tsx
│   │   │       ├── ImageUploader.tsx     # 배너/팝업/메뉴/공지 공용 업로드 위젯(관리자 폼용)
│   │   │       ├── ImageSlot.tsx         # 조회 화면용 이미지 표시 + 로딩/빈 상태(05_design 5-4)
│   │   │       ├── Button.tsx            # primary/accent/outline/text-link/inverse variant(05_design 5-3)
│   │   │       ├── Badge.tsx             # outline-accent/status-success/status-pending variant(05_design 5-5)
│   │   │       ├── ListRow.tsx           # Notice/Inquiry 공용 리스트 행(05_design 5-6)
│   │   │       ├── SectionHeader.tsx     # 제목+우측 액션 레이아웃(05_design 5-7)
│   │   │       └── FormInput.tsx         # 인증 폼 + 관리자 폼 공용 인풋(05_design 5-8)
│   │   ├── hooks/
│   │   │   └── useBreakpoint.ts          # 모바일/태블릿/데스크톱 판별(6-5 참고)
│   │   ├── store/
│   │   │   └── authStore.ts              # Zustand 로그인 상태 + isAdminMode 토글(6-7)
│   │   ├── api/                          # 백엔드 API 호출 함수(도메인별)
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── banners.ts
│   │   │   ├── popups.ts
│   │   │   ├── menus.ts
│   │   │   ├── notices.ts
│   │   │   └── inquiries.ts
│   │   ├── router.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── docker-compose.yml                    # 로컬 MySQL 구동용
└── README.md
```

### 4-2. 폴더 구조 원칙

- `backend/app/routers/`은 HTTP 요청을 받아 서비스 레이어를 호출하는 역할만 담당한다.
- `backend/app/services/`은 비즈니스 로직과 파일 저장을 담당한다.
- `backend/alembic/`은 `models.py`의 SQLAlchemy 모델 변경 사항을 마이그레이션 스크립트로 추적한다(예: `menus.sub_category` 컬럼 추가).
- `frontend/src/api/`는 백엔드 API 호출 함수를 도메인별 파일로 분리해 모아두는 역할을 담당한다.
- `frontend/src/components/`는 화면(도메인) 단위 하위 폴더(`layout/`, `banner/`, `menu/`, `support/` 등)로 나누고, 여러 화면에서 재사용하는 것만 `common/`에 둔다.
- 관리자 전용 UI는 별도 라우트 없이 각 페이지 컴포넌트 내부에 role 분기로 삽입한다. 재사용되는 관리자 폼은 `frontend/src/components/admin/`에 모아 각 페이지에서 import한다.
- `frontend/src/hooks/useBreakpoint.ts`는 6-5의 반응형 전략에서 CSS만으로 표현할 수 없는 컴포넌트 분기(예: 메뉴소개 `CategorySidebar` ↔ `CategoryTabBar`)에 사용한다.
- `frontend/src/components/common/`의 `ImageSlot`/`Button`/`Badge`/`ListRow`/`SectionHeader`/`FormInput`은 [05_design.md](05_design.md) 5장(공통 컴포넌트 분석)·7장(디렉토리 반영 제안)에서 목업을 분석해 도출한 것으로, 새 화면을 추가할 때도 우선 이 목록에서 재사용 가능한지 확인한다.
- `backend/static/uploads/`의 실제 업로드 파일은 `.gitignore`에 포함해 저장소에 커밋하지 않는다.

---

## 5. API 설계

### 5-1. 공통 응답 형식

```json
// 성공
{ "success": true, "data": "T" }

// 실패
{ "success": false, "error": { "code": "string", "message": "string" } }
```

---

### 5-2. Route / Endpoint 목록

> ⚠️ v0.2까지는 관리자 전용 API를 `/api/admin/*` 접두사로 분리했으나, v0.3부터는 별도 관리자 페이지가 없으므로 리소스별 경로(`/api/banners`, `/api/menus` 등)에 `role=admin` 검증을 인라인으로 적용하는 방식으로 변경한다.

### 인증

| Method | Path | 설명 | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | 회원가입 | 불필요 |
| POST | `/api/auth/login` | 로그인, JWT 발급 | 불필요 |

### 메인페이지 — 배너 / 팝업

| Method | Path | 설명 | Auth |
|---|---|---|---|
| GET | `/api/banners` | 노출 중인 배너 목록 조회 | 불필요 |
| POST | `/api/banners` | 배너 등록 | 필요(admin) |
| PATCH/DELETE | `/api/banners/{id}` | 배너 수정/삭제 | 필요(admin) |
| GET | `/api/popups` | 노출 중인 팝업 목록 조회 | 불필요 |
| POST | `/api/popups` | 팝업 등록 | 필요(admin) |
| PATCH/DELETE | `/api/popups/{id}` | 팝업 수정/삭제 | 필요(admin) |

### 메뉴소개

| Method | Path | 설명 | Auth |
|---|---|---|---|
| GET | `/api/menus?category={category}&subCategory={subCategory}` | 카테고리(음료는 하위 카테고리 포함)별 메뉴 카드(이미지·이름) 목록 조회 | 불필요 |
| GET | `/api/menus/{id}` | 메뉴 상세 조회(이미지·이름·가격·설명) | 불필요 |
| POST | `/api/menus` | 메뉴 등록 | 필요(admin) |

### 고객센터

| Method | Path | 설명 | Auth |
|---|---|---|---|
| GET | `/api/notices` | 공지사항 목록 조회 | 불필요 |
| GET | `/api/notices/{id}` | 공지사항 상세 조회 | 불필요 |
| POST | `/api/notices` | 공지사항 등록 | 필요(admin) |
| POST | `/api/inquiries` | 상담글(문의) 작성 | 필요 |
| GET | `/api/inquiries` | 상담글 목록 조회 (일반 사용자: 본인 글만 / admin: 전체) | 필요 |
| GET | `/api/inquiries/{id}` | 상담글 상세 조회 (작성자 본인 또는 admin만 허용) | 필요 |
| POST | `/api/inquiries/{id}/answer` | 상담글 답변 등록 | 필요(admin) |

### 업로드

| Method | Path | 설명 | Auth |
|---|---|---|---|
| POST | `/api/uploads` | 이미지 업로드 (배너/팝업/메뉴/공지 이미지 공용) | 필요 |

**Request Body 예시 (POST /api/menus)**

```json
{
  "category": "beverage",
  "subCategory": "coffee",
  "name": "시그니처 라떼",
  "imageUrl": "/static/uploads/1b2c3d.png",
  "price": 5500,
  "description": "배익거리만의 로스팅 원두로 만든 시그니처 라떼"
}
```

**Request Body 예시 (POST /api/inquiries/{id}/answer)**

```json
{
  "answerContent": "문의 주신 내용 확인했습니다. 해당 지점은 매주 월요일 정기 휴무입니다."
}
```

---

### 5-3. 인증 방식 결정

| 항목 | JWT + bcrypt 직접 구현 | Auth.js |
|---|---|---|
| 구현 복잡도 | 낮음 | 높음(소셜 로그인 미사용 시 과함) |
| 소셜 로그인 확장 | 직접 구현 필요 | 간단히 추가 가능 |
| MVP 적합성 | 적합 | 과할 수 있음 |

**결정**: JWT + bcrypt 직접 구현. 아이디/비밀번호 인증만 요구되는 범위이므로 별도 라이브러리 없이 단순하게 구현한다. bcrypt 해싱은 `passlib` 없이 `bcrypt` 패키지를 직접 사용한다(2장 각주 참고).

---

## 6. 핵심 기능 구현 설계

### 6-1. 메뉴 카테고리 조회 및 등록

```
[사이드바에서 상위 카테고리(시즌메뉴/음료/디저트) 선택, 음료는 하위 카테고리까지 선택]
      │
      ▼
[서버: category 값 검증 — season/beverage/dessert 외 값은 400]
      │
      ▼
[서버: category=beverage인 경우 subCategory 필수 검증 — coffee/non_coffee/tea/ade_juice 외 값(또는 누락)은 400]
      │
      ▼
[해당 카테고리(또는 카테고리+하위 카테고리)의 메뉴를 이미지+이름만 포함해 목록 반환]
      │
      ▼
[카드 클릭 시 /api/menus/{id}로 상세(가격·설명 포함) 조회]
```

관리자 등록 시에는 동일한 검증(카테고리·하위 카테고리 값, 필수 입력값)을 거친 뒤 `role=admin`을 추가로 확인한다.

### 6-2. 배너/팝업 노출 스케줄링

`start_at`, `end_at`, `is_active` 세 값을 조합해 노출 여부를 서버에서 판단한다. 조회 시점의 현재 시각이 노출 기간 내에 있고 `is_active`가 true인 항목만 클라이언트에 반환한다. 관리자가 기간이 지난 배너를 수동으로 끄지 않아도 자동으로 노출이 종료된다.

### 6-3. 이미지 업로드 파이프라인

```
[클라이언트: 파일 선택 (multipart/form-data)]
      │
      ▼
[서버: 확장자 화이트리스트 검증 — jpg/jpeg/png/gif/webp 외 거부]
      │
      ▼
[서버: 파일 크기 검증 — 5MB 초과 시 거부]
      │
      ▼
[서버: UUID로 파일명 재생성 후 backend/static/uploads/ 에 저장]
      │
      ▼
[저장된 파일의 정적 URL(/static/uploads/{uuid}.ext) 반환]
```

원본 파일명은 저장에 사용하지 않는다(경로 조작·중복 파일명 충돌 방지). 배너, 팝업, 메뉴, 공지사항 등록 폼 모두 동일한 업로드 API를 공유한다.

### 6-4. 상담글(문의) 접근 제어 및 답변 정책

- 상담글 상세 조회는 **작성자 본인 또는 관리자만** 허용한다. 그 외 사용자가 접근하면 403을 반환한다(프론트 라우팅 가드만으로는 불충분하므로 서버에서 매 요청마다 재검증).
- 답변 등록은 관리자만 가능하며, 답변 등록 시 `answer_content`와 `answered_at`을 함께 저장한다.
- 목록 화면의 "답변대기 / 답변완료" 상태 뱃지는 `answered_at`의 null 여부로 판단하고, 별도 상태 컬럼을 두지 않는다.

### 6-5. 반응형 레이아웃 전략

PRD 5-1의 모바일(375~767px)/태블릿(768~1023px)/데스크톱(1024~1440px) 3단계 브레이크포인트는 Tailwind CSS의 기본 브레이크포인트와 그대로 맞아떨어진다. 별도의 커스텀 브레이크포인트를 정의하지 않고 Tailwind 기본값을 그대로 사용한다.

| PRD 구분 | 화면 폭 | Tailwind 접두사 | 적용 방식 |
|---|---|---|---|
| 모바일 | ~767px | (접두사 없음, 기본) | 기본 클래스가 모바일 레이아웃을 담당(Mobile First) |
| 태블릿 | 768px~ | `md:` | `md:` 접두사로 2~3열 그리드, 사이드바 고정 등 재정의 |
| 데스크톱 | 1024px~ | `lg:` | `lg:` 접두사로 3~4열 그리드, 최대 폭 고정(`max-w-*` + `mx-auto`) 등 재정의 |

화면별 핵심 반응형 처리(PRD 4장 각 화면의 "반응형" 항목과 1:1 대응):

- **헤더/네비게이션**: 기본(모바일)은 로고+햄버거 버튼만 노출, 클릭 시 헤더 아래로 네비게이션 3항목(기업소개/메뉴소개/고객센터)이 드롭다운(아코디언)으로 펼쳐진다. 로그인/회원가입 링크는 헤더·모바일 패널 어디에도 없다(05_design 5-1). `md:` 이상에서는 네비게이션과 로그인/회원가입 버튼을 함께 가로로 노출하고 햄버거 버튼을 숨긴다. 관리자는 태블릿·데스크톱(`md:` 이상)에서만 로그인해 운영하는 것으로 가정하므로(PRD 3장 "데스크톱 또는 태블릿"과 동일 범위), 모바일 헤더에는 role 기반 분기가 필요 없다
- **메인페이지**: 퀵 링크는 기본 `grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-3`(또는 4)
- **메뉴소개**: 사이드바는 기본적으로 상단 가로 스크롤 탭(또는 드롭다운)으로 렌더링하고 `md:` 이상에서 좌측 고정 사이드바로 전환(레이아웃 자체가 바뀌므로 CSS만으로는 불충분해 브레이크포인트에 따라 다른 컴포넌트를 렌더링). 메뉴 카드 그리드는 기본 `grid-cols-2`, `md:grid-cols-3`, `lg:grid-cols-4`
- **고객센터**: 목록/상세 모두 기본은 풀폭, `md:` 이상에서는 `max-w-3xl mx-auto` 등으로 컨텐츠 폭을 제한해 가독성 확보
- **로그인/회원가입**: 폼 컨테이너에 `md:max-w-[400px] md:mx-auto` 적용

> 사이드바처럼 브레이크포인트에 따라 컴포넌트 자체가 달라지는 경우(탭 ↔ 고정 사이드바)는 CSS `display` 토글이 아니라 `useMediaQuery`류 훅으로 브레이크포인트를 감지해 컴포넌트를 분기 렌더링한다. 이렇게 해야 모바일에서 불필요한 사이드바 DOM을 아예 렌더링하지 않아 접근성(스크린 리더 탐색)과 성능 모두에 유리하다.

### 6-6. 비로그인 접근 가드 및 로그인 유도

헤더/모바일 메뉴 패널에는 로그인/회원가입 링크가 없으므로(6-5), 인증이 필요한 액션은 그 액션을 시도하는 시점에 로그인으로 유도한다(PRD 4-2 US-17).

```
① 비로그인 사용자가 인증이 필요한 액션 시도 (예: 고객센터에서 "문의 작성" 버튼 클릭)
      │
② 프론트엔드가 authStore의 로그인 상태를 먼저 확인
      │  ├── 비로그인 상태면 API 호출 없이 즉시 /login으로 이동(원래 경로는 별도로 보존하지 않음, MVP 범위)
      │  └── 로그인 상태면 정상적으로 액션 진행(API 호출)
      │
③ /login 화면에서 로그인 완료 시 원래 화면으로 복귀, 계정이 없으면 화면 내 링크로 /signup 이동
```

- 서버 측 API(`POST /api/inquiries` 등)는 여전히 `require_auth`로 401을 반환할 수 있어야 한다 — 프론트엔드 가드는 UX 편의이고, 실제 인가는 항상 서버에서 재검증한다(1-1 핵심 원칙과 동일).
- 관리자 전용 인라인 폼(BannerForm/PopupForm/MenuForm/NoticeForm/InquiryAnswerForm)은 관리자가 데스크톱에서만 로그인한다고 가정하므로, 이 가드 흐름은 일반 사용자의 상담글 작성 등 모바일에서도 발생 가능한 액션에 한해 필요하다.

### 6-7. 관리자 모드 토글

관리자로 로그인해도 각 화면의 등록/답변 버튼이 곧바로 보이지 않는다(PRD 4-6 US-18). 실수로 관리 기능을 건드리는 것을 막고, 방문자 화면과 관리 작업 화면을 시각적으로 분리하기 위함이다.

- `authStore`에 `isAdminMode: boolean`을 두고 기본값은 `false`. `role !== 'admin'`인 사용자에게는 토글 자체가 노출되지 않는다.
- 관리자가 헤더의 토글 아이콘을 클릭하면 `toggleAdminMode()`로 상태를 반전시킨다. 새로고침하면 다시 `false`로 초기화된다(별도 영속화 없음, MVP 범위).
- `BannerForm`/`PopupForm`/`MenuForm`/`NoticeForm`/`InquiryAnswerForm`은 각 페이지에서 `role === 'admin' && isAdminMode`일 때만 렌더링한다.
- **주의**: 이 토글은 순수 클라이언트 UI 상태이며 보안 경계가 아니다. 실제 인가는 각 API의 `require_admin`이 항상 서버에서 재검증한다(1-1 핵심 원칙, 6-6과 동일한 원칙).

---

## 7. 상태 관리 설계

### 7-1. 클라이언트 상태 관리 — Zustand

```typescript
// store/authStore.ts
interface AuthStore {
  user: { id: number; username: string; role: "user" | "admin" } | null;
  token: string | null;
  isAdminMode: boolean;           // 관리자 로그인 후 헤더 토글로만 true가 됨(6-7), 새로고침 시 false로 리셋
  login: (token: string, user: AuthStore["user"]) => void;
  logout: () => void;
  toggleAdminMode: () => void;
}
```

---

### 7-2. 서버 상태 관리 — TanStack Query

| Query Key | 설명 |
|---|---|
| `['banners']` | 활성 배너 목록 조회 |
| `['popups']` | 활성 팝업 목록 조회 |
| `['menus', category]` | 카테고리별 메뉴 목록 조회 |
| `['menu', id]` | 메뉴 상세 조회 |
| `['notices', page]` | 공지사항 목록 조회 |
| `['notice', id]` | 공지사항 상세 조회 |
| `['inquiries']` | 상담글 목록 조회(본인 또는 전체) |
| `['inquiry', id]` | 상담글 상세 조회 |

---

## 8. 인증 및 보안

### 8-1. 비밀번호 보안

```python
# auth.py
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())
```

> `passlib`을 거치지 않고 `bcrypt` 패키지를 직접 사용한다. `passlib`은 `bcrypt==4.1+`에서 내부적으로 참조하던 `__about__` 속성이 제거되며 호환성 문제가 보고된 이력이 있어, 이번 프로젝트에서는 이 의존성 자체를 없앴다.

---

### 8-2. 토큰 처리

```python
# JWT 페이로드 예시
{ "user_id": 1, "role": "admin", "iat": 1690000000, "exp": 1690604800 }

# 만료 시간: 7일
# 저장 위치: 클라이언트 localStorage (프로토타입 범위이므로 httpOnly 쿠키는 확장 과제로 남김)
```

---

### 8-3. API 인증 처리

```python
async def require_auth(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_jwt(token)
    if not payload:
        raise UnauthorizedError()
    return get_user(payload["user_id"])

async def require_admin(user: User = Depends(require_auth)) -> User:
    if user.role != "admin":
        raise ForbiddenError()
    return user
```

---

### 8-4. 관리자 계정 시딩

회원가입 API(`/api/auth/signup`)는 항상 `role=user`로만 계정을 생성하므로, 관리자 계정을 만드는 별도 경로가 필요하다. 서버 기동 시(FastAPI `startup` 이벤트) `ensure_admin_user()`를 호출해, 환경변수 `ADMIN_USERNAME`/`ADMIN_PASSWORD`로 지정된 계정이 DB에 없으면 `role=admin`으로 자동 생성한다. 이 관리자 계정으로 배너/팝업 관리, 메뉴 등록, 상담글 답변 등 모든 관리 기능을 각 도메인 화면에서 바로 사용할 수 있다.

```python
# seed.py
async def ensure_admin_user():
    username = os.environ["ADMIN_USERNAME"]
    password = os.environ["ADMIN_PASSWORD"]
    if not get_user_by_username(username):
        create_user(username=username, password_hash=hash_password(password), role=RoleEnum.admin)
```

이렇게 하면 회원가입 API 자체에는 관리자 상승 경로가 전혀 없어(보안상 바람직) 별도 시딩 절차로만 관리자 계정이 만들어진다.

---

### 8-5. 업로드 파일 보안

| 검증 항목 | 정책 |
|---|---|
| 확장자 | jpg, jpeg, png, gif, webp만 허용, 그 외 거부(400) |
| 파일 크기 | 5MB 초과 시 거부(400) |
| 저장 파일명 | 원본 파일명 미사용, UUID로 재생성 (경로 조작 방지) |
| 저장 위치 | `backend/static/uploads/` 하위로 고정, 클라이언트가 저장 경로를 지정할 수 없음 |

---

## 9. 로컬 개발 환경 설정

### 9-1. CORS 설정

프론트엔드(Vite, 기본 포트 5173)와 백엔드(FastAPI, 기본 포트 8000)가 서로 다른 포트에서 구동되므로 CORS 허용이 필요하다.

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 9-2. 환경변수 목록

```bash
# .env.example

# DB
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/baeikgeori

# Auth
JWT_SECRET_KEY=

# 관리자 계정 시딩
ADMIN_USERNAME=admin
ADMIN_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ 클라이언트에 노출되는 환경변수는 없다. 모든 키는 백엔드 서버에서만 사용한다.

### 9-3. Docker Compose 로컬 실행

`docker-compose.yml`은 MySQL 컨테이너만 구동한다(백엔드/프론트는 로컬에서 직접 `uvicorn`/`npm run dev`로 실행). 배포가 필요 없는 과제 범위이므로 애플리케이션 컨테이너화는 하지 않고, DB 재현성만 Docker Compose로 확보한다.

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: baeikgeori
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
```

---

## 10. 주요 기술 결정 및 트레이드오프

| 결정 | 선택 | 대안 | 이유 |
|---|---|---|---|
| 인증 방식 | JWT + bcrypt 직접 구현 | Auth.js, 세션 기반 | 아이디/비밀번호 인증만 필요, 배포 없이 로컬 실행이므로 세션 저장소 관리 부담을 줄이기 위해 |
| 비밀번호 해싱 라이브러리 | `bcrypt` 직접 사용 | `passlib` | `passlib`과 최신 `bcrypt` 간 호환성 이슈 이력이 있어 의존성 자체를 줄임 |
| 관리자 UI 배치 | 별도 관리자 페이지 없이 각 도메인 화면에 role 기반 인라인 노출 | 별도 `/admin` 대시보드 | PRD가 화면 구성을 5개 공개 페이지로 단순화하기로 결정했고, 관리 대상(배너/팝업/메뉴/상담 답변)이 각각 해당 도메인 페이지에 자연스럽게 속하므로 별도 대시보드 없이도 충분 |
| 메뉴 카테고리 모델링 | `category`(상위 ENUM 3값) + `sub_category`(하위 ENUM 4값, nullable) 컬럼 분리 | 단일 평면 ENUM, 별도 카테고리 테이블 | 음료만 하위 카테고리를 갖는 비대칭 구조를 정확히 표현해야 해서 평면 ENUM은 부적합. 카테고리 개수가 고정적이고 소수라 별도 테이블까지는 과함 |
| 상담글 답변 저장 방식 | `inquiries` 테이블의 컬럼(answer_content, answered_at) | 별도 answers 테이블 | 상담글 1건당 답변은 최대 1개(1:1 관계)이므로 별도 테이블이 과함 |
| 기업소개 콘텐츠 관리 방식 | 정적 프론트엔드 콘텐츠(하드코딩) | DB 기반 콘텐츠 관리 | PRD상 관리자 편집 요구사항이 없고 변경 빈도가 낮은 브랜드 스토리·매장 안내이므로 DB화가 과함, 추후 필요 시 확장 |
| 반응형 브레이크포인트 | Tailwind 기본 브레이크포인트(`md:` 768px, `lg:` 1024px) 그대로 사용 | 커스텀 브레이크포인트 정의 | PRD 5-1이 요구하는 모바일/태블릿/데스크톱 3단계 경계가 Tailwind 기본 `md`/`lg` 경계와 정확히 일치해 `tailwind.config`를 커스터마이징할 이유가 없음 |
| Rich Text Editor | Tiptap | Quill, CKEditor | React 컴포넌트 친화적이고 HTML 출력이 백엔드 저장 방식(Text 컬럼)과 바로 맞음, 관리자의 공지사항 작성에 사용 |
| 이미지 저장 방식 | 로컬 디스크 + `StaticFiles` | S3, Cloudinary 등 외부 스토리지 | 배포가 필요 없는 로컬 과제 범위이므로 외부 스토리지 연동은 과함 |
| 배포 방식 | 로컬 Docker Compose(DB만) | 클라우드 배포(Vercel+Railway 등) | 과제 요구사항상 배포 불필요, 로컬 재현성만 확보하면 충분 |

---

## 11. 리스크 및 대응 방안

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|---|---|---|---|
| 상담글 접근 제어 우회(URL 직접 접근으로 타인 문의 열람 시도) | 低 | 中 | 프론트 라우팅 가드만으로 끝내지 않고, 서버에서 매 요청마다 작성자 본인/관리자 여부를 재검증(6-4 참고) |
| Rich Text Editor(공지사항)와 백엔드 HTML 저장 간 XSS 위험 | 低 | 中 | 서버에서 저장 전 HTML sanitize 처리 |
| 악의적 파일 업로드(위장 확장자, 대용량 파일) | 低 | 中 | 확장자 화이트리스트 + 크기 제한 + UUID 파일명 재생성(8-5) |
| 메뉴 카테고리 값 오타/불일치로 사이드바 필터링 실패 | 低 | 低 | DB에서 `category`/`sub_category`를 ENUM 타입으로 값 자체를 제한, 프론트도 동일한 상수(상위 3종·하위 4종)를 공유 |
| 음료 외 카테고리에 `subCategory`를 잘못 전달하거나, 음료인데 `subCategory`를 누락 | 中 | 低 | 서버에서 `category=beverage`일 때만 `subCategory`를 필수로 검증하고, 그 외 카테고리에서는 값이 와도 무시(6-1 참고) |

---

## 12. 미결 사항 (Open Questions)

| # | 항목 | 현재 상태 | 결정 필요 시점 |
|---|---|---|---|
| OQ-01 | JWT 저장 위치(localStorage vs httpOnly 쿠키) 최종 결정 | 미결, 현재는 localStorage로 잠정 확정 | 2일차 인증 구현 착수 전 |

> v0.2의 OQ-02(AI 모델 ID 확정)는 PRD v0.2에서 AI 초안 기능 자체가 제거되어 함께 삭제했다.

---

## 13. 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v0.1 | 2026-07-19 | 최초 작성 |
| v0.2 | 2026-07-19 | AI 모델 ID 오류 수정(하드코딩 → 환경변수화), 이미지 업로드 API/파이프라인 추가, 관리자 계정 생성 경로 추가, CORS 설정 추가, bcrypt를 passlib 없이 직접 사용하도록 변경, PRD의 "신고" 기능 범위를 관리자 직접 삭제로 명확화하고 누락됐던 관리자 게시글 조회/삭제 라우트 추가, AI API 호출 남용 방지(쿨다운) 로직 추가 |
| v0.3 | 2026-07-19 | PRD v0.2 반영 — AI 초안 기능 전면 제거(아키텍처·API·환경변수·리스크·미결사항에서 삭제), 게시판·댓글·관리자 페이지를 기업소개·메뉴소개·고객센터로 대체, 배너/팝업/메뉴/상담 답변 관리를 각 도메인 페이지에 role 기반으로 인라인 배치(별도 `/api/admin/*` 접두사 제거), Menu/Notice/Inquiry 스키마 및 API 신규 설계 |
| v0.4 | 2026-07-19 | 메뉴 카테고리 모델을 단일 평면 ENUM(6값)에서 `category`(시즌메뉴/음료/디저트)+`sub_category`(coffee/non_coffee/tea/ade_juice, 음료 전용 nullable) 2단 구조로 변경. 관련 API(`/api/menus`), ORM 모델, 조회·등록 플로우, 리스크 항목을 함께 수정 |
| v0.5 | 2026-07-19 | PRD v0.4의 모바일/태블릿/데스크톱 반응형 브레이크포인트 요구사항 반영 — 6-5 반응형 레이아웃 전략(Tailwind 기본 `md`/`lg` 브레이크포인트 매핑, 화면별 그리드·사이드바 처리 방식) 신설, 10장에 브레이크포인트 결정 근거 추가 |
| v0.6 | 2026-07-19 | 4장 폴더 구조를 상위 디렉토리 나열 수준에서 실제 파일 단위(라우터·페이지·컴포넌트·훅·API 클라이언트 등) 프로젝트 파일트리로 확장, Alembic 마이그레이션 디렉토리 추가, 4-1/4-2로 절 재구성 |
| v0.7 | 2026-07-19 | 05_design.md(디자인 시스템 문서, 목업 분석) 7장 제안 반영 — `components/common/`에 ImageSlot/Button/Badge/ListRow/SectionHeader/FormInput 6종 추가, `components/menu/`에 모바일 전용 `CategoryTabBar.tsx` 추가, 4-2 원칙에 디자인 문서 출처 명시 |
| v0.8 | 2026-07-19 | PRD v0.5 반영 — 모바일 헤더를 드롭다운(아코디언)/네비 3항목만/로그인 링크 없음으로 확정(6-5), 관리자는 데스크톱 전용 로그인으로 가정한다는 원칙 명시, 비로그인 접근 가드 및 로그인 유도 흐름(6-6) 신설 |
| v0.9 | 2026-07-19 | 05_design.md OQ-D02 결정 반영 — 2장 기술 스택에 아이콘 라이브러리(`lucide-react`) 행 추가 |
| v0.10 | 2026-07-19 | PRD v0.6 반영 — Header가 로그인 전/후/관리자모드 3상태를 렌더링하도록 명시, `authStore`에 `isAdminMode` 추가, 관리자 모드 토글이 켜졌을 때만 관리자 인라인 폼이 렌더링되는 원칙(6-7) 신설 |
| v0.11 | 2026-07-19 | 문서 전체 재검토 — 6-5의 관리자 로그인 가능 범위 표현을 "데스크톱(`lg:` 이상)"에서 PRD·05_design과 동일한 "태블릿·데스크톱(`md:` 이상)"으로 정정, 메뉴 등록 플로우(1-2)에 관리자 모드 토글 언급 추가, API 명세의 관리자 관련 화면 설명에도 관리자 모드 토글 반영 |
