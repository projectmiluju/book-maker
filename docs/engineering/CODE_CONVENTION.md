# Book Maker Code Convention

## 1. 목적

이 문서는 `book-maker` 저장소의 코드 스타일, 자동 수정 기준, 품질 게이트를 정의한다.

목표는 다음과 같다.

- 프론트엔드와 백엔드가 같은 기준으로 정렬되게 한다
- 포맷팅과 import 정렬은 가능한 한 자동 수정되게 한다
- 로컬과 CI가 같은 명령으로 같은 품질 기준을 검증하게 한다

## 2. 기본 원칙

- 포맷팅은 `Prettier`가 담당한다
- 린트는 `ESLint`가 담당한다
- import 정렬은 `eslint-plugin-simple-import-sort`로 자동 수정한다
- 스타일 취향보다 일관성과 자동화를 우선한다
- 규칙은 현재 스택인 `Nuxt 3 + Vue 3`, `NestJS`와 충돌하지 않는 범위에서 유지한다

## 3. 공통 스타일

- 들여쓰기는 공백 2칸을 사용한다
- 줄바꿈은 `LF`를 사용한다
- 문자열은 기본적으로 작은따옴표를 사용한다
- 세미콜론은 유지한다
- trailing comma는 가능한 곳에 유지한다
- import는 기능 단위로 묶되, 최종 정렬은 린트 자동 수정 결과를 따른다

위 기준은 루트 `.editorconfig`와 `.prettierrc.json`을 기준으로 한다.

## 4. 패키지별 린트 기준

### Web (`apps/web`)

- `Vue`와 `TypeScript` 파일을 함께 검사한다
- `vue essential` 수준의 규칙으로 명백한 실수를 우선 막는다
- 페이지/레이아웃 파일 구조를 고려해 `multi-word component name` 규칙은 강제하지 않는다

### API (`apps/api`)

- `TypeScript` type-aware lint를 사용한다
- 테스트 파일까지 같은 기준으로 검사한다
- formatting 오류를 ESLint에 중복 위임하지 않고, Prettier와 역할을 분리한다

## 5. 표준 명령

루트에서 아래 명령을 기준으로 사용한다.

- `pnpm lint`
- `pnpm lint:fix`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`

패키지별 실행이 필요하면 아래를 사용한다.

- `pnpm lint:web`
- `pnpm lint:api`
- `pnpm typecheck:web`
- `pnpm typecheck:api`

## 6. CI 품질 게이트

GitHub Actions CI는 아래 순서로 검증한다.

1. install
2. lint
3. typecheck
4. build
5. backend e2e test

즉, PR 단계의 기본 품질 게이트는 `lint + typecheck + build + test`다.

## 7. 운영 원칙

- 로컬에서 자동 수정 가능한 항목은 `pnpm lint:fix`, `pnpm format`으로 먼저 정리한다
- 리뷰에서는 스타일 논쟁보다 규칙 위반과 구조적 문제를 우선 본다
- 새 패키지나 도구를 추가하면 이 문서와 실제 스크립트를 함께 갱신한다
