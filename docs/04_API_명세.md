# API 명세 — 배익거리(配益居里) 기업 홈페이지

**문서 버전**: v0.4
**작성자**: Nathan
**최초 작성일**: 2026-07-19
**최종 수정일**: 2026-07-19
**참조 PRD**: v0.6 / **참조 TDD**: v0.11
**공통 응답 형식**: `{ "success": boolean, "data": T }` / `{ "success": false, "error": { "code", "message" } }`

이 문서는 API 하나당 하나의 섹션으로 작성한다. 핵심 11개 API로 대표 흐름을 명세하며, 팝업 등록/공지사항 상세/공지사항 등록(관리자)/배너 수정·삭제 등 나머지 CRUD는 동일한 패턴(배너 등록 API-04, 메뉴 등록 API-07)을 따른다. 공지사항 등록은 `POST /api/notices`(인증 필요·admin)이며, Request Body `{ "title": "string", "content": "string" }`, Response `{ "id": "int" }`로 배너 등록(API-04)과 동일한 패턴이다.

---

## API-01. 회원가입

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 회원가입 |
| Method | POST |
| URL | `/api/auth/signup` |
| 설명 | 아이디/비밀번호로 신규 회원을 등록한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/signup` |
| 관련 ERD | `users` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Content-Type: application/json` |
| Query String | 없음 |
| Path Parameter | 없음 |
| Body | `{ "username": "string", "password": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 201 |
| 성공 Message | 회원가입이 완료되었습니다 |
| Data 구조 | `{ "id": "int", "username": "string" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 400 | INVALID_INPUT | 비밀번호는 8자 이상이어야 합니다 | 비밀번호 규칙 위반 |
| 409 | USERNAME_TAKEN | 이미 사용 중인 아이디입니다 | 아이디 중복 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [ ] 빈 상태를 처리할 수 있는가? (해당 없음)
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `User` |
| Validation Schema | `SignupRequest(username: str, password: str)` — 비밀번호 8자 이상 |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요(단일 insert) |
| 테스트 방법 | Swagger UI로 중복 아이디/정상 케이스 확인 |

---

## API-02. 로그인

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 로그인 |
| Method | POST |
| URL | `/api/auth/login` |
| 설명 | 아이디/비밀번호 검증 후 JWT를 발급한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/login` |
| 관련 ERD | `users` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Content-Type: application/json` |
| Body | `{ "username": "string", "password": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| 성공 Message | 로그인에 성공했습니다 |
| Data 구조 | `{ "token": "string", "user": { "id": "int", "username": "string", "role": "user|admin" } }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | INVALID_CREDENTIALS | 아이디 또는 비밀번호가 일치하지 않습니다 | 로그인 정보 불일치 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `User` |
| Validation Schema | `LoginRequest(username: str, password: str)` |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 정상/비정상 계정으로 로그인 후 토큰 디코딩 확인 |

---

## API-03. 배너 목록 조회

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 배너 목록 조회 |
| Method | GET |
| URL | `/api/banners` |
| 설명 | 노출 기간·활성 여부 조건을 만족하는 배너를 순서대로 조회한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/` |
| 관련 ERD | `banners` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Query String | 없음 |
| Path Parameter | 없음 |
| Body | 없음 |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `[{ "id": "int", "imageUrl": "string", "linkUrl": "string", "sortOrder": "int" }]` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 500 | SERVER_ERROR | 잠시 후 다시 시도해주세요 | 데이터 조회 실패 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가? (스켈레톤)
- [x] 빈 상태를 처리할 수 있는가? (활성 배너 없으면 영역 숨김)
- [x] 에러 상태를 처리할 수 있는가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Banner` |
| Validation Schema | 없음(쿼리 파라미터 없음) |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | `is_active`/`start_at`/`end_at` 조건을 바꿔가며 노출 여부 확인 |

---

## API-04. 배너 등록 (관리자)

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 배너 등록 |
| Method | POST |
| URL | `/api/banners` |
| 설명 | 관리자가 메인페이지 내 인라인 관리 폼에서 배너를 등록한다 |
| 인증 | 필요(admin) |
| 담당자 | Nathan |
| 관련 화면 | `/` (관리자가 관리자 모드를 켰을 때 노출되는 배너 등록 폼) |
| 관련 ERD | `banners` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Authorization: Bearer {token}` |
| Body | `{ "imageUrl": "string", "linkUrl": "string", "sortOrder": "int", "startAt": "string", "endAt": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 201 |
| Data 구조 | `{ "id": "int" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 로그인이 필요합니다 | 토큰 없음/만료 |
| 403 | FORBIDDEN | 관리자만 접근할 수 있습니다 | role != admin |
| 400 | INVALID_INPUT | 이미지 URL을 입력해주세요 | 필수값 누락 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Banner` |
| Validation Schema | `BannerCreateRequest(imageUrl, linkUrl, sortOrder, startAt, endAt)` |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 일반 사용자 계정으로 호출해 403 확인 |

---

## API-05. 메뉴 목록 조회 (카테고리별)

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 메뉴 목록 조회 |
| Method | GET |
| URL | `/api/menus` |
| 설명 | 선택한 상위 카테고리(음료인 경우 하위 카테고리까지)에 속한 메뉴를 카드(이미지+이름)용으로 조회한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/menu` |
| 관련 ERD | `menus` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Query String | `category: string (season\|beverage\|dessert, 필수), subCategory: string (coffee\|non_coffee\|tea\|ade_juice, category=beverage일 때 필수)` |
| Path Parameter | 없음 |
| Body | 없음 |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `[{ "id": "int", "name": "string", "imageUrl": "string" }]` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 400 | INVALID_CATEGORY | 존재하지 않는 카테고리입니다 | category 값이 3종 외의 값 |
| 400 | INVALID_SUB_CATEGORY | 음료 카테고리는 하위 카테고리를 선택해주세요 | category=beverage인데 subCategory 누락 또는 4종 외의 값 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가? (목록에는 이미지·이름만 필요, 가격·설명은 상세에서 조회)
- [x] 로딩 상태를 처리할 수 있는가? (카드 스켈레톤)
- [x] 빈 상태를 처리할 수 있는가? ("등록된 메뉴가 없습니다")
- [x] 에러 상태를 처리할 수 있는가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Menu` |
| Validation Schema | `MenuListQuery(category, subCategory)` — category는 Enum 검증, category=beverage일 때 subCategory 필수 검증 |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 시즌메뉴/디저트 및 음료 하위 4종을 각각 호출, 빈 카테고리/잘못된 category·subCategory 값 케이스 확인 |

---

## API-06. 메뉴 상세 조회

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 메뉴 상세 조회 |
| Method | GET |
| URL | `/api/menus/{id}` |
| 설명 | 메뉴 카드 클릭 시 이미지·이름·가격·설명을 조회한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/menu/:id` |
| 관련 ERD | `menus` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Path Parameter | `id: int` |
| Body | 없음 |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `{ "id": "int", "category": "string", "subCategory": "string \| null", "name": "string", "imageUrl": "string", "price": "int", "description": "string" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 404 | MENU_NOT_FOUND | 존재하지 않는 메뉴입니다 | id에 해당하는 메뉴 없음 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [ ] 빈 상태를 처리할 수 있는가? (해당 없음)
- [x] 에러 상태를 처리할 수 있는가? (존재하지 않는 id 접근 시 안내 + 목록 이동)

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Menu` |
| Validation Schema | 없음(Path Parameter만 사용) |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 존재하는 id / 존재하지 않는 id 각각 호출해 확인 |

---

## API-07. 메뉴 등록 (관리자)

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 메뉴 등록 |
| Method | POST |
| URL | `/api/menus` |
| 설명 | 관리자가 메뉴소개 화면 내 인라인 관리 폼에서 신규 메뉴를 등록한다 |
| 인증 | 필요(admin) |
| 담당자 | Nathan |
| 관련 화면 | `/menu` (관리자가 관리자 모드를 켰을 때 노출되는 메뉴 등록 폼) |
| 관련 ERD | `menus` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Authorization: Bearer {token}` |
| Body | `{ "category": "string", "subCategory": "string \| null", "name": "string", "imageUrl": "string", "price": "int", "description": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 201 |
| Data 구조 | `{ "id": "int" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 로그인이 필요합니다 | 토큰 없음/만료 |
| 403 | FORBIDDEN | 관리자만 접근할 수 있습니다 | role != admin |
| 400 | INVALID_INPUT | 카테고리, 이름, 가격을 확인해주세요 | 필수값 누락, category 값 오류, 또는 category=beverage인데 subCategory 누락/오류 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Menu` |
| Validation Schema | `MenuCreateRequest(category, subCategory, name, imageUrl, price, description)` — category=beverage일 때 subCategory 필수, 그 외에는 무시 |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 일반 사용자 계정 403 확인, 잘못된 category/subCategory 값 400 확인, 등록 후 목록/상세 재조회로 확인 |

---

## API-08. 공지사항 목록 조회

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 공지사항 목록 조회 |
| Method | GET |
| URL | `/api/notices` |
| 설명 | 휴무·신메뉴·채용 등 공지사항을 최신순으로 조회한다 |
| 인증 | 불필요 |
| 담당자 | Nathan |
| 관련 화면 | `/support` |
| 관련 ERD | `notices` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Query String | `page: int = 1, size: int = 10` |
| Body | 없음 |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `{ "items": [{ "id", "title", "createdAt" }], "total": "int", "page": "int" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 400 | INVALID_QUERY | 잘못된 페이지 값입니다 | page/size 값 이상 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 빈 상태를 처리할 수 있는가? ("등록된 공지사항이 없습니다")
- [x] 에러 상태를 처리할 수 있는가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Notice` |
| Validation Schema | `NoticeListQuery(page, size)` |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 빈 목록/정상 목록 케이스 확인 |

---

## API-09. 상담글(문의) 작성

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 상담글 작성 |
| Method | POST |
| URL | `/api/inquiries` |
| 설명 | 로그인한 사용자가 고객센터에 1:1 상담글을 작성한다 |
| 인증 | 필요 |
| 담당자 | Nathan |
| 관련 화면 | `/support` |
| 관련 ERD | `inquiries` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Authorization: Bearer {token}` |
| Body | `{ "title": "string", "content": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 201 |
| Data 구조 | `{ "id": "int" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 로그인이 필요합니다 | 토큰 없음/만료 |
| 400 | INVALID_INPUT | 제목과 내용을 입력해주세요 | 필수값 누락 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가?

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Inquiry` |
| Validation Schema | `InquiryCreateRequest(title, content)` |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | `user_id`는 토큰에서 추출해 저장되는지 확인, 비로그인 상태 401 확인 |

---

## API-10. 상담글 상세 조회

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 상담글 상세 조회 |
| Method | GET |
| URL | `/api/inquiries/{id}` |
| 설명 | 상담글 상세와 답변 여부를 조회한다. 작성자 본인 또는 관리자만 접근할 수 있다 |
| 인증 | 필요 |
| 담당자 | Nathan |
| 관련 화면 | `/support` (상세 보기) |
| 관련 ERD | `inquiries` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Authorization: Bearer {token}` |
| Path Parameter | `id: int` |
| Body | 없음 |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `{ "id": "int", "userId": "int", "title": "string", "content": "string", "answerContent": "string \| null", "answeredAt": "string \| null", "createdAt": "string" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 로그인이 필요합니다 | 토큰 없음/만료 |
| 403 | FORBIDDEN | 본인 상담글만 조회할 수 있습니다 | 작성자 본인도 관리자도 아닌 사용자의 접근 |
| 404 | INQUIRY_NOT_FOUND | 존재하지 않는 상담글입니다 | id에 해당하는 상담글 없음 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 빈 상태를 처리할 수 있는가? (답변 없으면 "답변대기중" 표시)
- [x] 에러 상태를 처리할 수 있는가? (403 시 안내 메시지)

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Inquiry` |
| Validation Schema | 없음(Path Parameter만 사용) |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 작성자 본인/타인/관리자 계정으로 각각 호출해 200/403 확인 |

---

## API-11. 상담글 답변 등록 (관리자)

### 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 상담글 답변 등록 |
| Method | POST |
| URL | `/api/inquiries/{id}/answer` |
| 설명 | 관리자가 상담글 상세 화면에서 모든 사용자의 상담글에 답변을 등록한다 |
| 인증 | 필요(admin) |
| 담당자 | Nathan |
| 관련 화면 | `/support` (관리자가 관리자 모드를 켰을 때 노출되는 상세 보기 + 답변 폼) |
| 관련 ERD | `inquiries` |

### 2. Request

| 항목 | 내용 |
| --- | --- |
| Headers | `Authorization: Bearer {token}` |
| Path Parameter | `id: int` |
| Body | `{ "answerContent": "string" }` |

### 3. Response

| 항목 | 내용 |
| --- | --- |
| 성공 Status | 200 |
| Data 구조 | `{ "id": "int", "answeredAt": "string" }` |

### 4. Error Response

| Status | errorCode | message | 발생 상황 |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 로그인이 필요합니다 | 토큰 없음/만료 |
| 403 | FORBIDDEN | 관리자만 접근할 수 있습니다 | role != admin |
| 404 | INQUIRY_NOT_FOUND | 존재하지 않는 상담글입니다 | id에 해당하는 상담글 없음 |
| 400 | INVALID_INPUT | 답변 내용을 입력해주세요 | 필수값 누락 |

### 5. 프론트엔드 확인 사항

- [x] 화면에서 필요한 데이터가 모두 있는가?
- [x] 로딩 상태를 처리할 수 있는가?
- [x] 에러 상태를 처리할 수 있는가?
- [x] 버튼 클릭 후 성공/실패 피드백이 명확한가? (답변 등록 후 "답변완료" 상태로 전환)

### 6. 백엔드 구현 메모

| 항목 | 내용 |
| --- | --- |
| 사용할 모델 | `Inquiry` |
| Validation Schema | `InquiryAnswerRequest(answerContent)` |
| 외부 API 사용 여부 | 없음 |
| 트랜잭션 필요 여부 | 불필요 |
| 테스트 방법 | 일반 사용자 403 확인, 존재하지 않는 id 404 확인, 답변 등록 후 재조회로 `answeredAt` 반영 확인 |

---

## 변경 이력

| 날짜 | 변경 내용 | 작성자 |
| --- | --- | --- |
| 2026-07-19 | 최초 작성 (핵심 7개 API) | Nathan |
| 2026-07-19 | PRD v0.2 반영 — AI 초안 생성/게시글/댓글 API 제거, 배너 등록 경로를 `/api/admin/banners` → `/api/banners`(인라인 admin 검증)로 변경, 메뉴(목록/상세/등록)·공지사항(목록)·상담글(작성/상세/답변) API 신규 작성 | Nathan |
| 2026-07-19 | 메뉴 카테고리 파라미터를 `category`(단일, 6종) → `category`(상위 3종) + `subCategory`(음료 하위 4종, 조건부 필수)로 변경. API-05/06/07 Query·Body·Error 응답 및 백엔드 구현 메모 갱신 | Nathan |
| 2026-07-19 | 문서 전체 재검토 — API-04/07/11의 "관련 화면" 설명에 관리자 모드 토글(PRD 4-6 US-18)을 반영 | Nathan |
