# WORKLOG

프로젝트 진행 상태를 가볍게 기록하는 작업 로그.

원칙:

- 길게 쓰지 않는다
- 매 작업 종료 시 갱신한다
- 완료 / 남은 일 / 다음 액션만 명확히 남긴다

---

## 2026-03-24 (PostgreSQL / Redis baseline)

### 완료

- 이슈 `#11` 기준 PostgreSQL / Redis infrastructure baseline 추가
- `pg`, `redis` client 의존성 추가
- `InfrastructureModule`, `DatabaseService`, `RedisService` 추가
- config namespace를 사용하는 DB/Redis 연결 설정 helper 분리
- 부트 시 연결 여부를 제어하는 env 키와 기본값 추가
- health 응답에 PostgreSQL / Redis 상태 포함
- 단위 테스트와 e2e 테스트로 비연결 테스트 환경 baseline 확인
- Docker Compose와 실제 API 부트로 로컬 PostgreSQL / Redis 연결 준비 상태 확인

### 현재 상태

- API가 PostgreSQL / Redis provider를 전역으로 재사용할 수 있는 구조를 갖췄다
- 기본 실행 환경에서는 앱 시작 시 두 연결을 확인하고 실패를 바로 드러낸다
- 테스트 환경에서는 bootstrap 연결을 비활성화해 로컬 의존성 없이 검증 가능하다

### 다음 액션

1. PostgreSQL 스키마와 migration baseline 결정
2. 사용자 / 인증 모듈에서 DB와 Redis provider를 실제 사용하도록 연결
3. 인증 세션과 사용자 엔티티 기준 테스트 설계 시작

### 메모

- 로컬 실연결 확인은 `docker compose up -d postgres redis` 후 `pnpm --filter @book-maker/api start`, `curl http://127.0.0.1:4000/api/health`로 확인
- 샌드박스에서는 로컬 포트 접속 제한으로 실연결 검증이 막혀 권한 상승으로 확인

---

## 2026-03-24

### 완료

- 이슈 `#9` 기준 NestJS config / env / validation baseline 추가
- `@nestjs/config` 기반 전역 ConfigModule 로딩 구성
- `app`, `database`, `redis` 설정 네임스페이스 분리
- 환경 변수 기본값 및 숫자/enum 검증 로직 추가
- 전역 `ValidationPipe`와 bootstrap 공통 설정 함수 추가
- API 단위 테스트와 e2e 테스트로 env 검증 및 전역 validation 동작 확인
- `.env.example`에 API / PostgreSQL / Redis 기준 키 보강

### 현재 상태

- API가 `process.env` 직접 참조 대신 공통 config 계층을 통해 설정을 읽는다
- 이후 PostgreSQL / Redis 연결 모듈이 같은 설정 키 구조를 재사용할 수 있다
- DTO 검증과 변환 baseline이 전역으로 적용될 준비가 됐다

### 다음 액션

1. PostgreSQL / Redis 실제 연결 모듈 추가
2. Config 값을 사용하는 DB/Redis provider 또는 infrastructure module 구성
3. 인증 기초 구현을 위한 사용자 / auth 모듈 골격 시작

### 메모

- 현재 env 검증은 커스텀 validator로 유지하고 있으며, 필요 시 추후 schema 기반 검증으로 확장 가능
- 전역 app 설정 함수는 `main.ts`와 e2e 테스트가 같은 bootstrap 규칙을 공유하도록 분리

---

## 2026-03-21

### 완료

- 이슈 `#7` 기준 코드 컨벤션 baseline 정리
- 루트 `.editorconfig`, `.prettierrc.json`, `.prettierignore` 추가
- `apps/web`, `apps/api` ESLint 기준 정리 및 import 자동 정렬 규칙 추가
- 루트 `lint`, `lint:fix`, `typecheck`, `format`, `format:check` 스크립트 추가
- CI에 `lint`, `typecheck` 단계 추가
- `docs/engineering/CODE_CONVENTION.md` 추가

### 현재 상태

- 프론트엔드와 백엔드에 공통 코드 스타일 baseline이 생김
- 로컬과 CI에서 같은 품질 명령을 사용할 수 있음
- import 정렬과 포맷팅 자동 수정 흐름이 정리됨

### 다음 액션

1. PostgreSQL / Redis 실제 기동 확인
2. NestJS Config / Validation / Env 로딩 구조 추가
3. 인증 기초 구현 준비

### 메모

- 포맷팅은 Prettier, 린트는 ESLint로 역할 분리
- CI 기본 품질 게이트는 `lint + typecheck + build + test` 기준으로 유지

---

## 2026-03-21

### 완료

- Git 저장소 초기화 및 기본 브랜치 `main`으로 변경
- `.gitignore` 추가
- 루트 문서를 `docs/product`, `docs/design`, `docs/engineering`, `docs/til` 구조로 정리
- 제품 기획 문서 작성
- 기술 스택 및 데이터/API/구현 계획 문서 작성
- 정적 프로토타입 제작
- 한글 UX 카피 가이드 작성
- 개발기 1편 작성
- `README.md` 작성
- `AGENTS.md` 작성
- Nuxt 3 워크스페이스 초기화 (`apps/web`)
- 루트 `pnpm-workspace.yaml`, `package.json` 추가
- 한글 기반 랜딩 / 아카이브 / 기록하기 / 초안 / 미리보기 라우트 골격 구현
- `pnpm build:web` 빌드 성공 확인

### 현재 상태

- 프론트엔드(Nuxt) 부트스트랩 완료
- 랜딩과 앱 기본 구조가 실제 코드로 시작됨
- 백엔드(NestJS)는 아직 초기화 전

### 다음 액션

1. NestJS 프로젝트 초기화
2. 로컬 개발 환경(PostgreSQL / Redis) 구성
3. CI 기본 골격과 `.env.example` 정리

### 메모

- 실제 구현은 한글 기준으로 진행
- MVP 범위를 벗어나는 기능은 `ROADMAP.md`에만 반영하고 구현은 보류

---

## 2026-03-21 (디자인 문서 동기화)

### 완료

- Stitch 기반 리디자인 결과를 다시 분석
- 실제 Nuxt 화면과 디자인 문서 간 어긋난 내용 정리
- `docs/design/DESIGN_SYSTEM.md`를 현재 구현 기준으로 갱신
- `docs/design/DESIGN_TOKENS.md`를 실제 토큰 값 기준으로 갱신
- `docs/design/AI_DESIGN_PROMPTS.md`를 한국어 우선, stitch 텍스트 무시, 실제 파일 재설계 지침 기준으로 갱신

### 현재 상태

- 디자인 방향 문서와 실제 구현이 다시 맞춰짐
- 현재 기준 디자인은 `상단바 + 좌측 사이드바 + 페이퍼 시트` 구조
- 아카이브는 검색 입력 없이 flat list 유지

### 다음 액션

1. 현재 디자인 기준으로 컴포넌트 추출 여부 판단
2. 또는 NestJS 부트스트랩으로 백엔드 시작
3. 필요 시 새 디자인안 반영 후 프론트 추가 조정

### 메모

- 프롬프트 문서도 이제 한국어 제품 기준으로 맞춤
- 전문 출판 용어보다 MVP 용어를 우선 사용

---

## 2026-03-21 (NestJS 부트스트랩)

### 완료

- 이슈 `#5` 생성
- `feat/nest-bootstrap` 브랜치 생성
- `apps/api` NestJS 앱 초기화
- 루트 `.env.example` 추가
- 루트 `docker-compose.yml` 추가
- `/api/health` 엔드포인트와 health 모듈 추가
- 루트에서 `build:api`, `test:api:e2e` 실행 가능하도록 스크립트 추가
- GitHub Actions CI 기본 워크플로 추가

### 현재 상태

- 웹과 API가 모두 워크스페이스에 포함됨
- PostgreSQL / Redis 로컬 실행 파일이 준비됨
- API는 `/api/health` 기준으로 빌드와 e2e 테스트까지 확인됨

### 다음 액션

1. Docker Compose 실제 기동 확인
2. NestJS에 Config / Validation / Env 로딩 구조 추가
3. Auth 모듈과 사용자 기본 엔티티 방향 잡기

### 메모

- API e2e 테스트는 로컬 샌드박스에서는 포트 바인딩 제한이 있어 권한 상승 후 검증함

---

## 2026-03-21 (커밋 컨벤션 정리)

### 완료

- `docs/engineering/COMMIT_CONVENTION.md` 추가
- 커밋 타입, 메시지 형식, 커밋 분리 기준 정리
- README와 AGENTS에 커밋 컨벤션 문서 연결

### 현재 상태

- 커밋 메시지와 커밋 분리 기준이 공식 문서로 고정됨
- 이후 커밋 보조 스킬이 참조할 기준이 생김

### 다음 액션

1. 현재 변경 파일을 논리적 단위로 묶는 커밋 스킬 설계
2. 커밋 스킬이 `COMMIT_CONVENTION.md`를 기준으로 동작하게 정의

### 메모

- 메시지 형식은 `type: 한글 요약`으로 유지
- 기본 타입은 `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`

---

## 2026-03-21 (서브에이전트 사용 지침 정리)

### 완료

- `docs/engineering/SUBAGENT_GUIDELINES.md` 추가
- 서브에이전트 사용 조건, 금지 상황, 역할 분리, write scope 규칙 정리
- README와 AGENTS에 서브에이전트 지침 문서 연결
- 메인 에이전트가 필요 시 자율적으로 서브에이전트를 사용할 수 있는 권한 명시
- 서브에이전트 사용 시 사용자에게 병렬 작업 여부를 알리는 규칙 반영

### 현재 상태

- 병렬 작업과 로컬 스킬 사용 기준이 분리됨
- 이후 서브에이전트 사용 시 프로젝트 기준을 먼저 참조할 수 있음

### 다음 액션

1. 필요 시 실제 작업에 서브에이전트 적용 패턴 검증
2. 병렬 작업이 필요한 시점에 지침 기준으로 역할 분리 적용

### 메모

- 스킬은 반복 가능한 절차
- 서브에이전트는 병렬 가능한 작업을 다루는 기준으로 정리
