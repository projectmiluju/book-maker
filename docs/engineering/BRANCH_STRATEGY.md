# Book Maker Branch Strategy

## 1. 목적

이 문서는 Book Maker 프로젝트의 브랜치 운영 기준을 정의한다.

목표는 다음과 같다.

- 작업 단위를 명확히 나눈다
- `main` 브랜치를 항상 안정적인 기준선으로 유지한다
- 문서/기능/버그 수정 흐름을 예측 가능하게 만든다
- 혼자 작업하더라도 미래의 자신이 맥락을 잃지 않게 한다

## 2. 기본 원칙

- 기본 브랜치는 `main`
- `main`은 항상 배포 가능하거나 최소한 안정적인 상태를 유지
- 직접 `main`에서 큰 작업을 계속 쌓지 않는다
- 기능, 버그, 문서 작업은 별도 브랜치에서 진행 후 PR로 병합

## 3. 브랜치 유형

### 기능 브랜치

형식:

- `feat/<short-description>`

예시:

- `feat/nuxt-bootstrap`
- `feat/auth-api`
- `feat/entry-autosave`
- `feat/draft-preview`

### 버그 수정 브랜치

형식:

- `fix/<short-description>`

예시:

- `fix/auth-refresh-loop`
- `fix/archive-empty-state`

### 문서 브랜치

형식:

- `docs/<short-description>`

예시:

- `docs/update-readme`
- `docs/test-strategy`

### 설정 / 환경 브랜치

형식:

- `chore/<short-description>`

예시:

- `chore/github-templates`
- `chore/docker-compose`
- `chore/ci-bootstrap`

### 리팩토링 브랜치

형식:

- `refactor/<short-description>`

예시:

- `refactor/auth-module-structure`
- `refactor/archive-state-splitting`

## 4. 브랜치명 규칙

- 소문자만 사용
- 공백 대신 `-` 사용
- 너무 길지 않게 작성
- 한 브랜치는 한 목적만 가진다

좋은 예:

- `feat/entry-crud`
- `fix/draft-order-bug`
- `docs/ux-copy-update`

좋지 않은 예:

- `feat/everything`
- `temp/test`
- `my-work`

## 5. 작업 흐름

권장 작업 흐름:

1. `main` 최신 상태 확인
2. 새 브랜치 생성
3. 작업 진행
4. 문서/테스트 필요 시 함께 반영
5. PR 생성
6. 체크리스트 검토
7. `main`으로 병합

## 6. PR 단위 원칙

- 하나의 PR은 하나의 목적을 가진다
- 문서 수정과 기능 구현이 강하게 연결되어 있다면 같이 포함 가능
- unrelated 변경을 한 PR에 섞지 않는다

좋은 예:

- `feat/entry-autosave` + 관련 테스트 + 관련 문서 수정

피해야 할 예:

- 인증 수정 + 랜딩 디자인 변경 + README 수정 + CI 추가를 한 PR에 몰기

## 7. 현재 프로젝트 기준 권장 브랜치 순서

다음 구현 순서를 기준으로 브랜치를 나눌 수 있다.

1. `chore/nuxt-bootstrap`
2. `chore/nest-bootstrap`
3. `chore/local-dev-infra`
4. `chore/ci-bootstrap`
5. `feat/auth-foundation`
6. `feat/entry-autosave`
7. `feat/archive-view`
8. `feat/draft-builder`
9. `feat/draft-preview`
10. `feat/landing-page`

## 8. 테스트 / 문서 연계 규칙

- 기능 브랜치에서는 필요한 테스트를 함께 고려한다
- 문서 기준이 바뀌면 문서 브랜치를 따로 파거나 같은 브랜치에서 함께 수정한다
- TDD 적용 대상 기능은 테스트를 먼저 작성하는 흐름을 우선 고려한다

## 9. 병합 원칙

- `main` 병합 전 최소한의 셀프 리뷰 수행
- 가능한 경우 PR 템플릿 체크리스트를 채운다
- CI가 붙기 시작하면, CI 통과 전 병합하지 않는다

## 10. 하지 말아야 할 것

- `main`에서 바로 장기 작업
- 한 브랜치에서 너무 많은 주제 다루기
- 문서와 구현이 크게 어긋난 상태로 병합
- 테스트가 필요한 변경인데 검증 없이 병합

## 11. 커밋 메시지 규칙

커밋 메시지는 타입 prefix + 한글 요약으로 작성한다.

예:

- `docs: 초기 기획 문서와 프로토타입 추가`
- `chore: Nuxt 프로젝트 초기화`
- `feat: 기록 작성 자동 저장 구현`
- `fix: 초안 순서 변경 오류 수정`

## 12. 최종 기준

좋은 브랜치 전략은 복잡한 규칙이 아니라 다음을 만족해야 한다.

- 지금 무엇을 하고 있는지 명확하다
- 왜 이 변경이 생겼는지 추적 가능하다
- `main`이 계속 기준점으로 유지된다
