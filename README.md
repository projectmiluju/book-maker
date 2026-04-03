# 안녕, 나의 바다

짧은 기록을 차곡차곡 쌓아 두고, 그것이 한 권의 책 초안으로 자라나게 만드는 글쓰기 제품.
공식 서비스명은 `안녕, 나의 바다`이며, 저장소와 내부 패키지 작업명은 당분간 `book-maker`를 유지한다.

현재 이 레포는 MVP 핵심 루프 구현과 기본 품질 게이트 정리까지 마친 상태다. 제품 기획, 정보 구조, 기술 의사결정, 데이터 모델, 정적 프로토타입 위에서 실제 Nuxt/Nest 앱, PostgreSQL/Redis 연동, 인증, 기록/아카이브/초안/미리보기, 랜딩 페이지, Playwright smoke E2E까지 연결되어 있다.

## 현재 상태

- MVP 핵심 루프 `write -> archive -> draft -> preview` 구현 완료
- 랜딩 페이지와 실제 앱 진입 CTA 연결 완료
- Playwright smoke E2E와 auth-expiry smoke, CI artifact 수집 경로까지 반영
- 아카이브 기본 검색 흐름으로 `Phase 2. Writing Depth And Archive Intelligence` 작업 시작

## 현재 방향

- `private-first writing product`
- 짧은 글을 기록한다
- 기록을 아카이브로 쌓는다
- 기록을 초안으로 묶는다
- 책처럼 읽히는 미리보기를 만든다

장기적으로는 공개 읽기 경험, 이미지 첨부, 출간용 PDF, 유사도 검사, AI 지원까지 확장할 수 있도록 설계했다.

## 확정 기술 스택

- Frontend: `Nuxt 3 + Vue 3`
- Backend: `NestJS`
- Main DB: `PostgreSQL`
- Cache/Auth: `Redis`
- Mobile: `responsive web first`
- Deferred: `MongoDB`, native mobile

기술 선택 이유는 [docs/engineering/TECH_DECISION.md](docs/engineering/TECH_DECISION.md)에 정리되어 있다.

## 문서 구조

### Product

- [PRODUCT_BRIEF.md](docs/product/PRODUCT_BRIEF.md)
- [USER_JOURNEY.md](docs/product/USER_JOURNEY.md)
- [MVP_SCOPE.md](docs/product/MVP_SCOPE.md)
- [SUCCESS_METRICS.md](docs/product/SUCCESS_METRICS.md)
- [ROADMAP.md](docs/product/ROADMAP.md)

### Design

- [IA.md](docs/design/IA.md)
- [SCREEN_LIST.md](docs/design/SCREEN_LIST.md)
- [DESIGN_PRINCIPLES.md](docs/design/DESIGN_PRINCIPLES.md)
- [AI_DESIGN_PROMPTS.md](docs/design/AI_DESIGN_PROMPTS.md)
- [UX_COPY_KO.md](docs/design/UX_COPY_KO.md)

### Engineering

- [TECH_PLAN.md](docs/engineering/TECH_PLAN.md)
- [TECH_DECISION.md](docs/engineering/TECH_DECISION.md)
- [DATA_MODEL.md](docs/engineering/DATA_MODEL.md)
- [DB_SCHEMA_PLAN.md](docs/engineering/DB_SCHEMA_PLAN.md)
- [BACKEND_API_PLAN.md](docs/engineering/BACKEND_API_PLAN.md)
- [AUTH_FLOW.md](docs/engineering/AUTH_FLOW.md)
- [FRONTEND_APP_STRUCTURE.md](docs/engineering/FRONTEND_APP_STRUCTURE.md)
- [IMPLEMENTATION_PHASES.md](docs/engineering/IMPLEMENTATION_PHASES.md)
- [CODE_CONVENTION.md](docs/engineering/CODE_CONVENTION.md)
- [COMMIT_CONVENTION.md](docs/engineering/COMMIT_CONVENTION.md)
- [SUBAGENT_GUIDELINES.md](docs/engineering/SUBAGENT_GUIDELINES.md)
- [TEST_STRATEGY.md](docs/engineering/TEST_STRATEGY.md)
- [DEVOPS_CICD_PLAN.md](docs/engineering/DEVOPS_CICD_PLAN.md)

### TIL

- [book-maker-devlog-01.mdx](docs/til/book-maker-devlog-01.mdx)

## 프로토타입

정적 시안은 `prototype/`에 있다.

- [Landing](prototype/index.html)
- [Archive](prototype/archive.html)
- [Write](prototype/write.html)
- [Draft Builder](prototype/draft-builder.html)
- [Draft Preview](prototype/draft-preview.html)

시안은 Stitch 결과를 바탕으로 MVP 방향에 맞게 덜어낸 버전이다.

## 다음 구현 방향

MVP는 기능 기준으로 닫힌 상태다. 다음 작업은 아래 순서를 기본으로 잡는다.

1. MVP closeout 기준과 문서를 유지
2. `Phase 2. Writing Depth And Archive Intelligence` 범위를 작은 단위로 순차 구현
3. non-blocking polish는 회귀나 명확한 사용성 공백이 있을 때만 다룬다

세부 기준은 [IMPLEMENTATION_PHASES.md](docs/engineering/IMPLEMENTATION_PHASES.md), [MVP_SCOPE.md](docs/product/MVP_SCOPE.md), [ROADMAP.md](docs/product/ROADMAP.md)를 따른다.

## 품질 명령

- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm test:web:e2e`
- `pnpm format`
- `pnpm format:check`
