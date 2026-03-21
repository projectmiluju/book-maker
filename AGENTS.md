# AGENTS.md

## 1. 목적

이 문서는 `안녕, 나의 바다` 프로젝트에서 작업하는 모든 AI 에이전트/대화 세션이 동일한 목표와 우선순위를 유지하도록 돕는 공통 작업 지침서다.

목표는 다음과 같다.

- 대화창이 바뀌어도 프로젝트 방향이 흔들리지 않게 한다
- 이미 정한 범위와 기술 결정을 다시 뒤집지 않게 한다
- 오늘 한 일 위에서 내일 자연스럽게 이어서 작업하게 한다
- 아직 만들지 말아야 할 것을 명확히 구분한다

## 2. 프로젝트 한 줄 정의

`안녕, 나의 바다`는 짧은 기록을 차곡차곡 쌓아 두고, 그것이 한 권의 책 초안으로 자라나게 만드는 글쓰기 제품이다.

## 3. 현재 프로젝트 상태

현재는 `프론트엔드 초기 구현이 시작된 단계`다.

이미 완료된 것:

- 제품 정의
- 사용자 여정
- MVP 범위
- 정보 구조
- 디자인 원칙
- 한글 UX 카피
- 기술 스택 결정
- 데이터 모델 방향
- 백엔드 API 계획
- DB 스키마 계획
- 구현 단계 문서
- 정적 프로토타입
- Git 저장소 초기화 및 문서 구조 정리

아직 시작하지 않은 것:

- NestJS 실제 프로젝트 초기화
- PostgreSQL / Redis 실제 연결
- 인증 구현
- 기록 / 초안 / 미리보기 실제 기능 구현

## 4. 절대 흔들리지 않아야 하는 핵심 방향

### 제품 방향

- 이 제품은 `private-first writing product`다
- 먼저는 나만의 기록과 초안에 집중한다
- 공개 읽기 경험, 출간, AI 기능은 후속 단계다

### MVP 방향

MVP는 아래 4가지만 증명하면 된다.

1. 사용자가 짧은 기록을 남길 수 있다
2. 기록이 아카이브에 쌓인다
3. 기록을 초안으로 묶을 수 있다
4. 책처럼 읽히는 미리보기를 볼 수 있다

### 기술 방향

기술 스택은 아래로 고정한다.

- Frontend: `Nuxt 3 + Vue 3`
- Backend: `NestJS`
- Main DB: `PostgreSQL`
- Cache/Auth: `Redis`
- Mobile: `responsive web first`
- Deferred: `MongoDB`, native mobile

이 결정은 취향이 아니라 현재 제품 요구 때문에 확정된 것이다.

### 품질 방향

이 프로젝트는 기능 구현만으로 끝내지 않는다.

반드시 아래 품질 방향을 따른다.

- 핵심 흐름은 테스트로 검증한다
- 인증, 소유권, autosave, draft reorder는 우선 보호 대상이다
- 테스트는 로컬뿐 아니라 CI에서 자동 실행되어야 한다
- PR 단계에서 lint, typecheck, test, build를 기본 품질 게이트로 본다
- 인증, autosave, draft reorder 같은 핵심 리스크 구간에는 선택적 TDD를 적용한다

## 5. 작업 우선순위

에이전트는 항상 아래 순서를 우선한다.

1. 구현에 필요한 현재 단계 작업
2. 이미 만든 문서/구조와의 정합성 유지
3. MVP 핵심 루프 완성
4. 이후 로드맵 기능은 문서화만 하고 구현은 보류

즉, 다음 작업이 애매하면 항상 이 질문부터 본다.

`이 작업이 지금 MVP 핵심 루프를 앞으로 밀어주는가?`

아니면 보류 또는 후순위다.

## 6. 지금부터의 기본 구현 순서

다음 구현 순서는 고정 기준으로 사용한다.

1. Nuxt 3 프로젝트 초기화
2. NestJS 프로젝트 초기화
3. PostgreSQL / Redis 로컬 개발 환경 연결
4. 테스트/CI 기본 골격 설정
5. 인증 기초 구현
6. 기록 작성 / 자동 저장
7. 아카이브 구현
8. 초안 생성 / 순서 정리
9. 초안 미리보기
10. 랜딩 페이지 실제 구현

세부 내용은 `docs/engineering/IMPLEMENTATION_PHASES.md`를 따른다.

## 7. 지금 만들지 말아야 할 것

아래는 로드맵에는 있지만 지금 구현하면 안 된다.

- 이미지 첨부
- 공개 책 읽기 화면
- EPUB/PDF export
- 표절/유사도 검사
- 챕터 자동 생성
- AI 글쓰기 기능
- 공동 작업
- 네이티브 모바일 앱
- MongoDB 도입
- 테스트 전략 없이 기능만 먼저 계속 추가하는 것
- CI 없이 수동 검증만 반복하는 것

이 기능들은 필요하면 `docs/product/ROADMAP.md`에 반영만 하고 구현은 뒤로 미룬다.

## 8. 디자인/카피 작업 원칙

- 실제 구현은 한글 기준이다
- 공식 서비스명은 `안녕, 나의 바다`를 사용한다
- 저장소/패키지명 `book-maker`는 내부 작업명으로 유지한다
- 용어는 `docs/design/UX_COPY_KO.md`를 따른다
- 디자인은 조용하고 문학적이며 여백이 있어야 한다
- 메모 앱처럼 보여선 안 된다
- SNS 피드처럼 보여선 안 된다
- 과한 편집 툴처럼 보여서도 안 된다

## 9. 작업 전 확인해야 할 문서

에이전트는 구현 전에 아래 문서를 우선 참고한다.

### 제품

- `docs/product/PRODUCT_BRIEF.md`
- `docs/product/MVP_SCOPE.md`
- `docs/product/ROADMAP.md`

### 디자인

- `docs/design/IA.md`
- `docs/design/DESIGN_PRINCIPLES.md`
- `docs/design/UX_COPY_KO.md`

### 엔지니어링

- `docs/engineering/TECH_PLAN.md`
- `docs/engineering/TECH_DECISION.md`
- `docs/engineering/DATA_MODEL.md`
- `docs/engineering/BACKEND_API_PLAN.md`
- `docs/engineering/DB_SCHEMA_PLAN.md`
- `docs/engineering/FRONTEND_APP_STRUCTURE.md`
- `docs/engineering/IMPLEMENTATION_PHASES.md`
- `docs/engineering/CODE_CONVENTION.md`
- `docs/engineering/COMMIT_CONVENTION.md`
- `docs/engineering/SUBAGENT_GUIDELINES.md`
- `docs/engineering/TEST_STRATEGY.md`
- `docs/engineering/DEVOPS_CICD_PLAN.md`

## 10. 작업 방식 규칙

### 해야 할 것

- 현재 상태를 먼저 읽고 이어서 작업한다
- 새 작업은 기존 문서와 충돌하지 않게 한다
- 큰 결정을 바꾸면 문서도 같이 수정한다
- 구현 후에는 다음 단계가 자연스럽게 이어지도록 정리한다
- 핵심 기능은 테스트 가능하게 설계한다
- CI에 올릴 수 없는 작업 흐름을 당연한 전제로 두지 않는다
- 리스크가 큰 도메인 로직은 가능하면 테스트를 먼저 작성하고 구현한다
- 병렬화 이득이 있으면 메인 에이전트가 자율적으로 서브에이전트를 사용할 수 있다
- 서브에이전트를 사용할 때는 먼저 범위와 write scope를 분리한다
- 서브에이전트를 사용할 때는 중간 진행 메시지에서 병렬 작업 여부와 역할 분리를 사용자에게 알린다
- 서브에이전트 결과는 메인 에이전트가 검토하고 통합한다

### 하지 말아야 할 것

- 이미 확정한 기술 스택을 임의로 바꾸지 않는다
- MVP 범위를 임의로 키우지 않는다
- 후속 로드맵 기능을 갑자기 구현하지 않는다
- 영어 카피 기준으로 실제 화면을 확정하지 않는다
- 테스트를 나중으로 무기한 미루지 않는다
- 품질 게이트 없이 main 기준 작업을 계속 쌓지 않는다
- 모든 작업에 기계적으로 TDD를 강제하지 않는다
- 서브에이전트끼리 자연스럽게 알아서 정렬될 것이라고 가정하지 않는다
- 같은 파일을 여러 서브에이전트에게 동시에 맡기지 않는다

## 11. 매 세션 시작 시 해야 할 일

새로운 에이전트/세션은 아래 순서로 시작한다.

1. `README.md` 확인
2. `AGENTS.md` 확인
3. 현재 브랜치와 Git 상태 확인
4. `docs/engineering/IMPLEMENTATION_PHASES.md` 확인
5. `docs/engineering/TEST_STRATEGY.md`와 `docs/engineering/DEVOPS_CICD_PLAN.md` 확인
6. 지금 단계에 맞는 다음 작업 1개를 선택

## 12. 매 세션 종료 시 해야 할 일

작업을 마칠 때는 아래를 남긴다.

- 무엇을 했는지
- 무엇이 아직 남았는지
- 다음으로 무엇을 해야 하는지
- 문서 수정이 필요하면 어떤 문서가 바뀌어야 하는지

## 13. 지금 시점의 다음 액션

현재 가장 우선인 다음 액션은 아래다.

1. Nuxt 3 프로젝트 초기화
2. NestJS 프로젝트 초기화
3. Docker Compose / `.env.example` / CI 기본 골격 정리

즉, 이제부터는 문서 작성보다 실제 코드베이스 부트스트랩과 테스트/CI 기반 마련이 우선이다.
