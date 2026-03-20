# Book Maker DevOps / CI-CD Plan

## 1. 목적

이 문서는 Book Maker 프로젝트의 DevOps 및 CI/CD 전략을 정의한다.

목표는 다음과 같다.

- 로컬 개발 환경을 빠르게 재현 가능하게 만든다
- 테스트와 빌드를 자동화해 품질 게이트를 만든다
- 배포 과정을 수작업이 아닌 파이프라인으로 관리한다
- 포트폴리오 관점에서도 "개발뿐 아니라 운영 품질까지 고려한 프로젝트"로 설명 가능하게 한다

## 2. 현재 전제

확정 스택:

- Frontend: `Nuxt 3 + Vue 3`
- Backend: `NestJS`
- Main DB: `PostgreSQL`
- Cache/Auth: `Redis`

MVP에서는:

- 웹 앱 중심
- 모바일은 반응형 우선
- MongoDB 없음

## 3. DevOps 철학

이 프로젝트의 DevOps 목표는 "복잡한 클라우드 쇼케이스"가 아니다.

핵심은 다음이다.

1. 누구나 같은 방식으로 로컬 개발 가능
2. PR 단계에서 품질 검증 자동화
3. 배포가 예측 가능하고 재현 가능
4. 장애 시 원인을 추적할 수 있는 최소 관측성 확보

## 4. 환경 전략

권장 환경 구분:

- `local`
- `test`
- `staging`
- `production`

초기 MVP에서는 최소 아래 3개를 우선 관리한다.

- `local`
- `test`
- `production`

`staging`은 배포 여건에 따라 추후 추가 가능

## 5. 로컬 개발 환경 전략

### 권장 방향

- 애플리케이션은 로컬에서 직접 실행
- PostgreSQL / Redis는 Docker Compose로 실행

이유:

- 프론트/백엔드 개발 피드백 루프가 빠름
- DB/캐시 의존성은 환경 재현성이 중요함
- 모든 것을 컨테이너로 감싸는 것보다 현재 생산성이 높음

### 로컬 구성 요소

- `Nuxt dev server`
- `NestJS dev server`
- `PostgreSQL container`
- `Redis container`

### 추후 문서화 필요

- `docker-compose.yml`
- `.env.example`
- `DEV_SETUP.md`

## 6. CI와 CD를 분리해서 생각하기

### CI

코드의 품질을 자동 검증하는 단계

반드시 포함:

- dependency install
- lint
- typecheck
- unit test
- integration test
- build

### CD

검증된 코드를 자동으로 배포하는 단계

MVP 초기에는 다음 수준을 권장:

- main merge 시 자동 배포
- frontend / backend 분리 배포 가능 구조

## 7. 추천 파이프라인 구조

## 7.1 Pull Request CI

트리거:

- PR 생성
- PR 업데이트

필수 단계:

1. checkout
2. dependency install
3. cache restore
4. lint
5. typecheck
6. backend unit/integration test
7. frontend unit/component test
8. build

선택 단계:

- Playwright smoke E2E

PR 통과 기준:

- 모든 필수 단계 성공

## 7.2 Main Branch CI/CD

트리거:

- `main` 브랜치 push

권장 단계:

1. checkout
2. install
3. lint
4. typecheck
5. tests
6. build
7. artifact packaging
8. deploy
9. deploy health check

## 8. GitHub Actions 전략

이 프로젝트는 GitHub Actions를 기준으로 설계한다.

### 필요한 워크플로우

#### 1) `ci.yml`

역할:

- PR 품질 게이트

주요 job:

- `frontend-check`
- `backend-check`

#### 2) `deploy-frontend.yml`

역할:

- Nuxt 앱 배포

#### 3) `deploy-backend.yml`

역할:

- NestJS API 배포

#### 4) `e2e.yml` 또는 CI 내부 job

역할:

- 핵심 사용자 흐름 smoke test

## 9. 테스트 환경 전략

### Backend CI test

권장 방식:

- GitHub Actions service container로 PostgreSQL / Redis 실행
- 테스트 전용 env 사용
- migration 적용 후 테스트 실행

### Frontend CI test

권장 방식:

- API mock 또는 테스트용 backend endpoint 사용
- component/unit는 빠르게 실행
- E2E는 핵심 흐름만 최소 유지

## 10. 캐시 전략

CI 속도 최적화를 위해 캐시를 사용한다.

예:

- pnpm store cache
- npm/yarn cache
- Playwright browser cache

주의:

- 캐시로 인해 오래된 의존성이 섞이지 않게 key를 명확히 잡는다

## 11. 브랜치 전략

MVP 초기 권장 전략:

- `main`: 배포 가능한 안정 브랜치
- 기능 단위 feature branch

예:

- `feat/nuxt-bootstrap`
- `feat/auth-api`
- `feat/entry-autosave`

규칙:

- 직접 `main`에 대규모 작업하지 않음
- PR을 통해 CI를 통과한 뒤 병합

## 12. 릴리즈 전략

초기에는 정교한 semver release보다 단순한 운영이 낫다.

권장:

- `main` merge 기반 연속 배포
- 의미 있는 시점에만 태그 생성

추후 필요 시:

- release note 자동화
- changelog 관리

## 13. 배포 전략

아직 실제 인프라는 확정하지 않았지만, 설계 원칙은 먼저 정한다.

### Frontend 배포

권장 조건:

- 정적 자산과 SSR/Nitro 배포를 수용 가능해야 함
- 빠른 배포와 롤백이 쉬워야 함

후보:

- Vercel
- Docker 기반 자체 서버
- AWS 기반 배포

### Backend 배포

권장 조건:

- NestJS API를 안정적으로 실행
- env 관리 가능
- health check 가능
- 로그 수집 가능

후보:

- Docker + EC2
- Railway / Render 류 PaaS
- ECS/Fargate 추후 검토

현재는 "포트폴리오와 속도" 관점에서 과도한 인프라보다 운영 일관성이 더 중요하다.

## 14. Secret / 환경변수 관리

원칙:

- `.env`는 커밋하지 않음
- `.env.example`로 구조만 공유
- GitHub Actions secret 사용
- local/test/prod env 키를 구분

예상 env:

- frontend public base url
- backend database url
- redis url
- jwt secret
- refresh token secret
- app base url

## 15. 데이터베이스 운영 전략

### Migration

권장:

- 마이그레이션 도구를 기준으로 스키마 버전 관리
- 로컬, 테스트, 프로덕션 모두 동일한 migration 흐름 유지

### CI에서의 DB 준비

- 테스트용 DB 생성
- migration 실행
- 테스트 수행

### 절대 하지 말 것

- production DB 스키마를 수동으로만 관리
- 환경마다 다른 수동 SQL 누적

## 16. 관측성(Observability) 전략

MVP에서도 최소 관측성은 필요하다.

### Backend

- 구조화된 로그
- health endpoint
- 에러 로깅

### Frontend

- 런타임 오류 추적 도입 가능성 검토
- 주요 에러 포인트 수집

### 추후 확장

- Sentry
- uptime monitoring
- basic performance monitoring

이 프로젝트는 포트폴리오 관점에서도 "장애를 어떻게 볼 것인가"가 중요하다.

## 17. 실패 대응 전략

배포 파이프라인은 성공만 고려하면 안 된다.

반드시 정의할 것:

- build 실패 시 배포 중단
- test 실패 시 배포 중단
- deploy 후 health check 실패 시 실패 상태 반환
- 롤백 가능한 구조 우선

## 18. 품질 게이트

PR / 배포 이전 품질 게이트:

1. lint 통과
2. typecheck 통과
3. backend tests 통과
4. frontend tests 통과
5. build 통과

선택 게이트:

- Playwright smoke test
- coverage threshold

## 19. 이 프로젝트에서 포트폴리오용으로 보여줄 수 있는 DevOps 포인트

이 프로젝트는 다음 항목을 이력서/포트폴리오 문장으로 전환할 수 있어야 한다.

- GitHub Actions 기반 PR 품질 게이트 구축
- PostgreSQL / Redis service container를 이용한 백엔드 통합 테스트 자동화
- lint, typecheck, unit/integration test, build를 포함한 CI 파이프라인 설계
- main merge 기반 자동 배포 및 health check 검증
- env/secret 분리와 migration 기반 DB 운영 전략 수립

## 20. 실제 구현 우선순위

### Step 1

- `.env.example` 설계
- Docker Compose로 PostgreSQL / Redis 실행
- Nuxt / Nest 프로젝트 초기화

### Step 2

- GitHub Actions `ci.yml`
- lint / typecheck / build 자동화

### Step 3

- backend unit/integration test CI 연결
- frontend unit/component test CI 연결

### Step 4

- 배포 파이프라인 추가
- health check 및 최소 운영 검증

### Step 5

- smoke E2E 추가
- coverage / quality gate 보강

## 21. 하지 말아야 할 것

- 처음부터 쿠버네티스나 과한 인프라를 도입하지 않는다
- CI 없이 구현만 먼저 계속 밀지 않는다
- 배포를 수작업 복붙 프로세스로 오래 유지하지 않는다
- 테스트와 빌드가 자동화되지 않은 상태에서 배포를 반복하지 않는다

## 22. 최종 기준

Book Maker의 DevOps / CI-CD는 아래를 만족해야 한다.

- 로컬 개발 환경이 빠르게 재현된다
- PR에서 품질이 자동 검증된다
- main 브랜치는 항상 배포 가능한 상태를 지향한다
- 테스트와 배포가 사람 기억이 아니라 파이프라인에 의해 관리된다
