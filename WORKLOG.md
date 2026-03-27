# WORKLOG

프로젝트 진행 상태를 가볍게 기록하는 작업 로그.

원칙:

- 길게 쓰지 않는다
- 매 작업 종료 시 갱신한다
- 완료 / 남은 일 / 다음 액션만 명확히 남긴다

---

## 2026-03-27 (Playwright smoke e2e CI stabilization)

### 완료

- 이슈 `#37` 기준 GitHub Actions `ci.yml`에서 web smoke e2e를 Docker Compose 대신 service container 기반으로 정리
- PostgreSQL / Redis, auth env, Playwright browser cache를 job 레벨에서 명시해 CI 전제를 runner 외부 상태에 덜 의존하도록 보강
- `apps/web/playwright.config.ts`에서 CI일 때는 Nuxt preview와 non-watch API server를 사용하도록 바꿔 smoke 기동 순서를 더 안정화
- API CORS가 `NUXT_PORT` 기반 preview origin도 허용하도록 맞춰 CI smoke에서 signup 요청이 브라우저 정책에 막히지 않게 조정

### 현재 상태

- web smoke e2e는 local과 CI에서 서로 다른 서버 기동 특성을 가지되 같은 시나리오를 공유하도록 정리되었다
- PR 품질 게이트가 Docker Compose 컨테이너 이름이나 watch server 재시작에 덜 의존하게 되었다
- 남은 후속 작업은 인증 만료 대응 같은 추가 smoke 시나리오를 넓히는 쪽이다

### 다음 액션

1. 인증 만료 대응 smoke 시나리오를 추가해 세션 단절 리스크를 브라우저 수준에서 보호한다
2. CI에서 smoke 실행 시간을 보며 cache key나 step 순서를 필요한 범위만 다듬는다
3. 핵심 루프 smoke가 충분히 안정적이면 후속 시나리오를 별도 이슈로 점진적으로 확장한다

### 메모

- 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build`, `CI=true pnpm test:web:e2e` 기준으로 확인한다
- CI에서는 built web app을 `nuxt preview`로 띄우고, API는 watch 없는 `nest start` 경로를 사용한다

---

## 2026-03-27 (Playwright smoke gate operations)

### 완료

- 이슈 `#41` 기준 Playwright가 `test-results`와 HTML report를 명시적으로 남기도록 설정해 CI 실패 분석 경로를 고정
- GitHub Actions `ci.yml`에 Playwright artifact 업로드를 추가해 smoke 실패 시 trace, screenshot, report를 바로 확인할 수 있게 정리
- smoke 시나리오 수를 늘리지 않고 현재 core-loop + auth-expiry 2개 시나리오의 운영 디버깅 가능성을 우선 보강

### 현재 상태

- CI에서 Playwright smoke가 실패해도 report와 test-results를 artifact로 수집해 원인 파악이 쉬워졌다
- 현재 품질 게이트는 smoke 실행 자체뿐 아니라 실패 분석 자산까지 함께 남기는 구조가 됐다
- 남은 후속 작업은 실제 GitHub Actions run 기준으로 timeout, retry, artifact 크기를 보며 필요한 범위만 미세 조정하는 쪽이다

### 다음 액션

1. GitHub Actions 실제 run에서 artifact 업로드와 report 내용을 확인해 디버깅 동선이 충분한지 점검한다
2. smoke 실행 시간이 길어지면 retry 수나 step 분리를 최소 범위로 조정한다
3. 후속 smoke 시나리오가 늘어나더라도 현재 artifact 구조를 유지할지 별도 job으로 나눌지 판단한다

### 메모

- 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `pnpm test:web:e2e` 기준으로 확인한다
- artifact 업로드는 실패 전용이 아니라 `always()`로 두어 flaky 분석 시에도 동일한 산출물을 확보한다

---

## 2026-03-27 (Auth expiry smoke e2e)

### 완료

- 이슈 `#38` 기준 Playwright auth helper를 추가해 write 화면 회원가입과 local storage session 조작을 재사용 가능하게 정리
- access token이 더 이상 유효하지 않을 때 autosave 요청이 401 이후 세션을 정리하고 로그인 화면으로 복귀하는 smoke 시나리오를 추가
- 인증 만료 시 저장 요청이 무한 반복되지 않고 한 번만 발생하는지 브라우저 수준에서 함께 확인

### 현재 상태

- 핵심 루프 smoke 외에 인증 세션 단절 리스크도 브라우저 E2E로 회귀 보호 범위에 들어왔다
- 현재 auth 구조는 silent refresh보다 세션 정리/로그인 재진입 흐름을 우선 검증하는 상태다
- 남은 후속 작업은 CI에서 이 시나리오 실행 시간과 flaky 포인트를 관찰하며 필요한 범위만 다듬는 쪽이다

### 다음 액션

1. GitHub Actions에서 auth-expiry smoke까지 포함한 Playwright 실행 시간을 보고 retry나 step 분리를 필요한 수준만 검토한다
2. auth/session 구조가 실제 refresh 흐름까지 확장되면 별도 smoke로 silent refresh 성공/실패 분기를 나눈다
3. 고위험 회귀 구간은 현재처럼 최소 시나리오 중심으로만 점진 확장한다

### 메모

- 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `pnpm test:web:e2e` 기준으로 확인한다
- 이번 smoke는 현재 구현과 맞춰 `refresh 복구`가 아니라 `세션 정리 후 로그인 재진입` 흐름을 보호한다

---

## 2026-03-27 (Playwright smoke e2e baseline)

### 완료

- 이슈 `#35` 기준 `apps/web`에 Playwright baseline과 핵심 사용자 흐름 smoke 시나리오를 추가
- 랜딩 CTA에서 시작해 `write -> archive -> draft -> preview`로 이어지는 최소 E2E를 실제 UI 기준으로 연결
- smoke 시나리오가 덜 brittle하게 동작하도록 랜딩, write, draft 화면에 최소 테스트 훅을 추가
- 루트 스크립트와 CI 워크플로에 web smoke e2e 실행 경로를 보강

### 현재 상태

- MVP 핵심 루프는 unit/integration 수준을 넘어 실제 브라우저 흐름으로도 회귀를 확인할 수 있는 baseline이 생겼다
- PR 품질 게이트에서 backend e2e와 별도로 frontend 핵심 사용자 흐름 smoke를 연결할 수 있는 구조가 마련되었다
- 남은 후속 작업은 smoke 범위를 넓히기보다 flaky 포인트를 줄이고 필요한 최소 시나리오만 정제하는 쪽에 가깝다

### 다음 액션

1. smoke E2E를 실제 CI에서 안정적으로 반복 실행하면서 flaky 지점을 정리한다
2. 필요하면 인증 만료 복구나 entry reorder 같은 고위험 흐름을 후속 smoke 시나리오로 분리한다
3. landing과 preview 주변 polish는 회귀 보호 범위를 유지한 채 필요한 수준만 다듬는다

### 메모

- 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build`, `test:e2e`를 기준으로 확인
- web smoke e2e는 PostgreSQL / Redis가 켜진 상태에서 API와 web 서버를 함께 띄우는 구조를 사용한다

---

## 2026-03-27 (Landing page implementation)

### 완료

- 이슈 `#33` 기준 `apps/web/app/pages/index.vue` 랜딩 페이지를 실제 Nuxt 화면으로 재구성
- 현재 MVP 흐름에 맞춘 hero, 문제 설명, 사용 흐름, 구현 상태, CTA 섹션을 한글 카피 기준으로 정리
- `landing-content.ts`로 랜딩 문구와 링크를 분리하고 Vitest로 핵심 구조/경로를 검증
- 랜딩 전용 스타일을 보강해 prototype 방향을 유지하면서 현재 앱 라우트 기준 CTA를 실제 동작 경로로 연결

### 현재 상태

- 사용자는 랜딩에서 제품 메시지와 현재 구현된 MVP 흐름을 한눈에 이해하고, 바로 기록/아카이브/초안 화면으로 진입할 수 있다
- `안녕, 나의 바다`의 public-facing 첫 화면이 정적 시안이 아니라 실제 앱 상태와 맞는 Nuxt 화면으로 연결되었다
- MVP 핵심 화면 범위는 구현되었고, 남은 후속 작업은 polish와 핵심 E2E 보강 쪽에 가깝다

### 다음 액션

1. preview와 landing을 포함한 핵심 사용자 흐름 E2E 시나리오를 설계하고 최소 smoke 범위를 추가한다
2. 랜딩과 app 사이 전환에서 copy / spacing / CTA 우선순위를 필요한 범위만 다듬는다
3. PR 품질 게이트 기준으로 web build 경고와 향후 CI 연동 범위를 점검한다

### 메모

- 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build` 기준으로 확인
- web build는 Nuxt `module-preload-polyfill` sourcemap 경고가 있었지만 빌드는 정상 완료됐다

---

## 2026-03-27 (Draft preview flow)

### 완료

- 이슈 `#31` 기준 `apps/api`에 `GET /drafts/:id/preview` 계약과 preview 응답 타입을 추가
- 초안 ownership과 존재하지 않는 draft 경계를 유지한 채 ordered entry를 연속 읽기용 preview 데이터로 변환
- `apps/web/app/pages/app/drafts/preview.vue`를 실제 API 기반 화면으로 교체하고 draft detail에서 preview 진입 링크 연결
- `useDraftPreview` composable과 관련 단위 테스트를 추가하고 preview reading layout을 실제 초안 데이터에 맞게 보강

### 현재 상태

- 사용자는 초안 상세 화면에서 바로 미리보기로 이동해 제목과 기록 본문을 한 권의 시작처럼 연속해서 읽어볼 수 있다
- Draft Flow 이후 MVP 핵심 루프가 preview 단계까지 이어져 `write -> archive -> draft -> preview` 흐름이 실제 코드로 연결되었다
- 남은 주요 MVP 화면 범위는 랜딩 페이지 실제 구현과 preview 경험 세부 다듬기 정도다

### 다음 액션

1. draft preview에서 detail로 복귀하는 흐름과 reading polish를 필요한 범위만 다듬는다
2. 랜딩 페이지를 실제 Nuxt 화면으로 옮겨 MVP 주요 화면 구현을 마무리한다
3. 필요하면 preview 핵심 흐름에 대한 E2E 시나리오를 후속 이슈로 추가한다

### 메모

- 검증은 `pnpm --filter @book-maker/api lint`, `typecheck`, `test`, `test:e2e`, `build`, `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build` 기준으로 확인
- web build는 Nuxt `module-preload-polyfill` sourcemap 경고가 있었지만 빌드는 정상 완료됐다

---

## 2026-03-27 (Draft entry removal flow)

### 완료

- 이슈 `#29` 기준 `apps/api`에 `DELETE /drafts/:draftId/entries/:entryId` 계약과 제거 후 position 재정렬 로직 추가
- 초안 상세 화면에서 담긴 기록을 바로 뺄 수 있는 UI와 remove mutation 상태, 오류 메시지 연결
- 제거 직후 초안 목록/상세 동기화와 빈 초안 상태 반영을 `useDrafts`에 연결
- Drafts 서비스 테스트, fake PostgreSQL/Redis e2e, 프론트 composable 테스트에 remove 시나리오 보강

### 현재 상태

- 사용자는 초안 상세 화면에서 불필요한 기록을 제거하고 남은 기록 순서를 연속된 position으로 유지할 수 있다
- Draft Organization MVP 범위의 add / reorder / remove 흐름이 API와 프론트 양쪽에서 모두 연결되었다
- 다음 핵심 후속 범위는 preview API와 실제 preview 화면 연결이다

### 다음 액션

1. draft preview API를 추가해 초안을 연속 읽기 데이터로 변환한다
2. `/app/drafts/preview`를 실제 draft 데이터에 연결해 책처럼 읽히는 화면을 만든다
3. draft detail에서 preview 진입 흐름을 연결하고 관련 테스트를 보강한다

### 메모

- 검증은 `pnpm --filter @book-maker/api lint`, `typecheck`, `test`, `test:e2e`, `pnpm --filter @book-maker/web lint`, `typecheck`, `test` 기준으로 확인
- reorder 검증은 remove 이후가 아니라 빈 payload 경계로 유지해 API 계약과 테스트 의도를 맞췄다

---

## 2026-03-26 (Draft reorder flow)

### 완료

- 이슈 `#27` 기준 `apps/api`에 `PATCH /drafts/:id/entries/reorder` 계약과 순서 재정렬 로직 추가
- 초안 상세 화면에서 위/아래 이동 버튼으로 기록 순서를 바꾸는 reorder UI 연결
- `useDrafts`에 reorder mutation 상태와 오류 메시지를 추가하고 초안 detail/list 동기화 유지
- Drafts 서비스 테스트, fake PostgreSQL/Redis e2e, 프론트 composable 테스트에 reorder 시나리오 보강

### 현재 상태

- 사용자는 초안 상세 화면에서 담아둔 기록의 순서를 실제로 바꿀 수 있다
- draft organization MVP 범위 중 reorder가 API와 프론트 양쪽에서 연결되었다
- entry 제거와 preview 전용 API/UI는 아직 후속 범위로 남아 있다

### 다음 액션

1. entry 제거 흐름을 추가해 초안 정리 baseline을 완성한다
2. draft preview API와 실제 preview 화면 연결을 시작한다
3. draft detail에서 reorder와 remove를 함께 다루는 정리 UX를 다듬는다

### 메모

- reorder는 초안에 담긴 전체 entry id 집합을 그대로 보내는 계약으로 구현해 순서 무결성을 우선 보호했다
- 검증은 `apps/api`, `apps/web`의 lint/typecheck/test/build 중심으로 확인한다

---

## 2026-03-26 (Draft web integration)

### 완료

- 이슈 `#25` 기준 `apps/web` 초안 목록/상세 화면을 실제 draft API에 연결
- `app/types/drafts.ts`, `useDrafts` composable, draft API client를 추가해 초안 조회/생성/entry 추가 흐름 연결
- `/app/drafts`를 목록 + 빈 초안 생성 화면으로 재구성하고 `/app/drafts/[id]` 상세 화면 추가
- draft detail에서 초안에 담긴 기록과 아직 담지 않은 기록을 함께 보여주고 선택 첨부 UI 추가
- loading / empty / error / unauthenticated 상태를 목록/상세 화면에 반영
- `useDrafts.spec.ts`로 초안 목록/상세/생성/첨부 기본 상태 테스트 추가

### 현재 상태

- 사용자는 프론트에서 저장된 초안 목록을 보고, 새 초안을 만든 뒤 상세 화면에서 기록을 초안에 담기 시작할 수 있다
- draft API baseline이 정적 화면이 아닌 실제 앱 흐름으로 연결되어 Phase 5 초입의 사용자 경험이 보이기 시작했다
- reorder, entry 제거, preview 전용 API/UI는 아직 후속 범위로 남아 있다

### 다음 액션

1. draft reorder API와 프론트 순서 변경 UI를 구현한다
2. entry 제거 흐름을 추가해 초안 정리 baseline을 완성한다
3. draft preview API와 실제 preview 화면 연결을 시작한다

### 메모

- 프론트 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build` 기준으로 확인한다
- 현재 entry 추가 UI는 초안에 아직 담기지 않은 기록을 선택해 붙이는 baseline에 집중했다

---

## 2026-03-26 (Draft API baseline)

### 완료

- 이슈 `#23` 기준 `apps/api` 초안 도메인 baseline 추가
- PostgreSQL migration `0003_create_drafts.sql`로 `drafts`, `draft_entries` 테이블 및 인덱스 추가
- `POST /drafts`, `GET /drafts`, `GET /drafts/:id`, `PATCH /drafts/:id`, `POST /drafts/:id/entries` 구현
- 초안 목록 응답에 `entryCount`를 포함하고 상세 응답에 ordered draft entries 구조 추가
- draft ownership, 존재하지 않는 리소스, 동일 초안 내 중복 entry 첨부 방지 로직 추가
- Drafts 서비스 단위 테스트와 fake PostgreSQL / Redis 기반 e2e 테스트 보강

### 현재 상태

- 인증된 사용자는 자신의 초안을 생성, 조회, 수정하고 기록을 초안에 순서대로 담기 시작할 수 있다
- 초안 상세 응답이 이후 프론트 draft 화면이 바로 사용할 수 있는 baseline 계약을 제공한다
- reorder, entry 제거, preview 전용 계약은 아직 구현되지 않았고 후속 이슈 범위로 남아 있다

### 다음 액션

1. `apps/web` draft list / detail 화면을 실제 draft API에 연결한다
2. draft entry reorder API와 제거 API를 추가해 초안 정리 흐름을 완성한다
3. draft preview API와 프론트 preview 화면 연결을 시작한다

### 메모

- 백엔드 검증은 `pnpm --filter @book-maker/api lint`, `typecheck`, `test`, `test:e2e` 기준으로 확인한다
- 초안 baseline 리스크는 ownership, 존재하지 않는 entry 첨부, 중복 첨부 경계를 서비스/e2e 테스트로 먼저 고정했다

---

## 2026-03-25 (Archive list / detail integration)

### 완료

- 이슈 `#21` 기준 `apps/web` 아카이브 목록 화면을 실제 entry list API에 연결
- `GET /entries` 기반 list state, empty state, error state UI 추가
- `/app/entries/[id]` 상세 화면을 추가하고 `GET /entries/:id` 연결
- `useEntriesArchive` composable과 archive/detail 조회 테스트 추가
- write 화면에서 방금 저장한 기록을 archive/detail로 이동하는 링크 추가

### 현재 상태

- 사용자는 프론트에서 저장한 기록을 아카이브 목록에서 다시 찾고 상세 화면으로 열 수 있다
- 아카이브는 인증 세션, 로딩, 빈 상태, 조회 실패를 구분해 보여준다
- write -> archive -> detail -> write 재진입 흐름이 한 사이클로 이어진다

### 다음 액션

1. `/login`, `/signup` 전용 인증 화면과 app auth middleware를 정리
2. draft 생성 baseline과 entry 선택 흐름을 시작한다
3. archive/detail 조회에 대한 component 또는 page-level 테스트 범위를 넓힌다

### 메모

- 프론트 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build` 기준으로 확인
- archive/detail 리스크는 composable 테스트로 list loaded/empty와 detail error 경계를 먼저 고정했다

---

## 2026-03-25 (Write UI / autosave integration)

### 완료

- 이슈 `#19` 기준 `apps/web` 기록 작성 화면을 실제 auth / entry API에 연결
- runtime config 기반 `NUXT_PUBLIC_API_BASE`와 fetch client 추가
- 로컬 세션 저장 composable과 inline signup / login 흐름 추가
- `useEntryEditor` composable로 entry create 후 debounced update autosave 흐름 구현
- 저장 중 / 저장됨 / 저장 실패 / 세션 만료 상태 UI와 재시도 흐름 추가
- `entryId` query 기반 기존 기록 불러오기 연결
- Vitest 기반 프론트 autosave 상태 테스트 추가

### 현재 상태

- 프론트에서 인증 세션을 만든 뒤 같은 write 화면에서 바로 기록 생성과 자동 저장을 확인할 수 있다
- 첫 저장은 create API, 이후 저장은 update API로 이어지는 흐름이 화면 상태와 함께 동작한다
- access token 만료 시 autosave가 `세션 확인 필요` 상태로 전환되고 사용자가 원인을 볼 수 있다

### 다음 액션

1. 아카이브 목록/상세 화면을 entry list/detail API와 연결
2. `/login`, `/signup` 전용 인증 화면과 app auth middleware를 정리
3. write 화면에서 생성된 entry를 archive/detail 흐름과 자연스럽게 연결

### 메모

- 프론트 검증은 `pnpm --filter @book-maker/web lint`, `typecheck`, `test`, `build` 기준으로 확인
- autosave 핵심 리스크는 composable 단위 테스트로 `saving -> saved`, `401 -> auth-required` 전환을 검증

---

## 2026-03-25 (Entry API / autosave baseline)

### 완료

- 이슈 `#17` 기준 `entries` 모듈과 entry API baseline 추가
- PostgreSQL `entries` 테이블 migration `0002_create_entries.sql` 추가
- `POST /entries`, `GET /entries`, `GET /entries/:id`, `PATCH /entries/:id`, `DELETE /entries/:id` 구현
- title/body/status DTO와 public entry 응답 구조 추가
- `PATCH /entries/:id`에서 `updatedAt`, `lastSavedAt`를 함께 갱신하는 autosave 기준 반영
- AuthGuard를 연결한 사용자별 entry ownership 검증 추가
- Entries 서비스 단위 테스트와 fake PostgreSQL / Redis 기반 e2e 테스트 보강

### 현재 상태

- 인증된 사용자가 자신의 기록을 생성, 조회, 수정, 삭제할 수 있는 API 기준이 생겼다
- autosave에 필요한 `lastSavedAt` 갱신 규칙과 ownership 경계가 backend에서 검증된다
- 다음 단계인 아카이브 UI/API 또는 기록 작성 화면 연결 작업을 이 API 위에서 이어갈 수 있다

### 다음 액션

1. 기록 작성 화면을 실제 entry create/update API에 연결
2. autosave 상태 표시와 저장 실패 UI 흐름 구현
3. 아카이브 목록/상세 화면을 entry list/detail API와 연결

### 메모

- entry API 검증은 `pnpm --filter @book-maker/api lint`, `typecheck`, `test`, `test:e2e` 기준으로 확인
- e2e에서는 fake PostgreSQL / Redis provider로 CRUD, ownership, autosave 갱신 계약을 검증

---

## 2026-03-25 (Auth baseline)

### 완료

- 이슈 `#15` 기준 사용자 / Auth 모듈 baseline 추가
- `users`, `auth` 모듈과 JWT token / password hashing / Redis refresh session service 추가
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` 구현
- Bearer access token 기반 `AuthGuard`와 `CurrentUser` decorator 추가
- auth env 설정과 `.env.example` 인증 키 추가
- Auth 서비스 단위 테스트와 fake PostgreSQL / Redis 기반 e2e 테스트 추가

### 현재 상태

- API가 private-first writing을 위한 기본 인증 흐름을 제공한다
- 회원가입, 로그인, 세션 갱신, 로그아웃, 현재 사용자 bootstrap이 가능한 상태다
- 다음 엔트리/초안 API는 이 인증 guard와 사용자 스코프 기준 위에서 구현을 이어갈 수 있다

### 다음 액션

1. 기록 작성 API baseline 추가
2. 엔트리 생성 / 수정 / 삭제와 autosave 기준 테스트 설계
3. 인증 guard를 엔트리 도메인에 연결해 사용자 소유권 검증 시작

### 메모

- refresh token은 Redis에 hash 형태로 저장하고 refresh / logout 시 무효화한다
- 현재 검증은 `pnpm --filter @book-maker/api lint:fix`, `typecheck`, `test`, `test:e2e` 기준으로 확인

---

## 2026-03-25 (PostgreSQL schema / migration baseline)

### 완료

- 이슈 `#13` 기준 PostgreSQL schema / migration baseline 추가
- 루트 `db:migrate:api`, API `db:migrate` 스크립트 추가
- SQL 기반 migration runner 추가
- `schema_migrations` 테이블을 사용하는 migration 기록 기준 추가
- 초기 migration `0001_create_users.sql` 추가
- `users` 테이블 baseline과 `pgcrypto` extension 적용
- Docker Compose PostgreSQL에 migration 적용 및 재실행 안전성 확인

### 현재 상태

- 로컬 PostgreSQL에 초기 스키마를 적용할 수 있는 실행 흐름이 생겼다
- `users` 테이블과 migration 기록 테이블이 실제 DB에 생성되는 것을 확인했다
- 이후 인증/사용자 모듈은 migration baseline 위에서 구현을 이어갈 수 있다

### 다음 액션

1. 사용자 / 인증 모듈 골격 추가
2. 회원가입과 로그인에 필요한 비밀번호 해싱, JWT, Redis 세션 제어 설계
3. 인증 API 기준 단위 / 통합 테스트 추가

### 메모

- 실 DB 검증은 `docker compose up -d postgres`, `pnpm db:migrate:api`, `docker compose exec -T postgres psql ...` 순서로 확인
- migration 재실행 시 `No pending migrations.`를 확인해 idempotent baseline을 검증

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
