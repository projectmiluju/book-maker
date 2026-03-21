# 안녕, 나의 바다

짧은 기록을 차곡차곡 쌓아 두고, 그것이 한 권의 책 초안으로 자라나게 만드는 글쓰기 제품.
공식 서비스명은 `안녕, 나의 바다`이며, 저장소와 내부 패키지 작업명은 당분간 `book-maker`를 유지한다.

현재 이 레포는 실제 구현에 들어가기 전 단계의 기준 저장소다. 제품 기획, 정보 구조, 기술 의사결정, 데이터 모델, 프로토타입, 한글 UX 카피까지 먼저 정리해 두었다.

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

## 다음 구현 순서

1. Nuxt 3 프로젝트 초기화
2. NestJS 프로젝트 초기화
3. PostgreSQL / Redis 로컬 개발 환경 연결
4. 테스트 전략과 CI 기본 골격 반영
5. 인증 기초 구현
6. 기록 작성 / 자동 저장 / 아카이브 구현
7. 초안 생성 / 정렬 / 미리보기 구현
8. 랜딩 페이지 실제 구현

세부 순서는 [IMPLEMENTATION_PHASES.md](docs/engineering/IMPLEMENTATION_PHASES.md)를 따른다.

## 품질 명령

- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`
