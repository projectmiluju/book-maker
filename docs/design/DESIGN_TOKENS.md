# Book Maker Design Tokens

## 1. 목적

이 문서는 Book Maker의 디자인 토큰 기준을 정의한다.

역할은 다음과 같다.

- 색상, 간격, 타이포, 그림자, 레이아웃 기준을 공통 언어로 만든다
- 화면마다 스타일 값이 임의로 늘어나는 것을 막는다
- 컴포넌트화와 리디자인 시 기준점이 되게 한다

## 2. 토큰 원칙

- 토큰은 시각 취향이 아니라 제품 일관성을 위한 기준이다
- 가능한 한 의미 기반 이름을 사용한다
- 색은 역할로 구분하고, 컴포넌트는 토큰을 소비만 한다
- 토큰은 `global token -> semantic token -> component usage` 흐름으로 본다

## 3. Color Tokens

### Background / Surface

- `--bg`
  - 전체 앱의 기본 배경
  - 현재 값: `#f7f4ef`

- `--surface`
  - 가장 기본적인 종이/패널 표면
  - 현재 값: `#fffdfa`

- `--surface-low`
  - 기본 배경보다 한 단계 구조가 드러나는 표면
  - 주로 sidebar, section band
  - 현재 값: `#f2eee7`

- `--surface-mid`
  - 버튼, 보조 패널, 상태 강조용 중간 표면
  - 현재 값: `#ebe6de`

### Text

- `--text`
  - 주요 텍스트
  - 현재 값: `#232425`

- `--text-muted`
  - 본문 보조 설명
  - 현재 값: `#666760`

- `--text-faint`
  - metadata, eyebrow, hint
  - 현재 값: `#8a8a82`

### Line

- `--line`
  - 기본 경계선
  - 현재 값: `rgba(35, 36, 37, 0.08)`

- `--line-strong`
  - 강조된 경계 또는 분리선
  - 현재 값: `rgba(35, 36, 37, 0.16)`

### Accent

- `--accent`
  - 강조색
  - 현재 값: `#1f2e45`

원칙:

- accent는 주색이 아니라 구조를 잡는 보조 역할
- 너무 많은 색을 쓰지 않는다

## 4. Typography Tokens

현재 구현은 토큰 변수화까지는 하지 않았지만, 아래 역할 기준으로 정리한다.

### Display

- hero title
- preview title
- draft title

기준:

- 매우 큰 크기
- 강한 weight
- 아주 좁은 letter spacing

### Page Title

- 랜딩 섹션 제목
- archive page title
- app 주요 화면 제목

### Section Title

- 기능 설명, 밴드 제목, 카드 상위 제목

### Body Large

- 랜딩 본문
- manuscript preview 본문
- writing area 본문

### Body Default

- 카드 설명
- 보조 본문

### Meta / Label

- eyebrow
- 상태 라벨
- 날짜
- 작은 내비게이션

## 5. Spacing Tokens

현재 CSS에 숫자로 직접 들어간 값이 있으므로, 앞으로 아래 기준으로 수렴한다.

### Space Scale

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 24px
- `--space-6`: 32px
- `--space-7`: 40px
- `--space-8`: 56px
- `--space-9`: 72px
- `--space-10`: 96px

원칙:

- component 내부 패딩은 `space-3` ~ `space-6`
- section 간격은 `space-8` 이상
- hero와 preview header는 `space-9` 이상

## 6. Layout Tokens

### Width

- `--container-max`: landing 기준 최대 폭
- `--app-max`: app shell 기준 최대 폭
- `--reading-max`: writing / preview 기준 본문 폭

현재 값:

- `--container-max: 1200px`
- `--app-max: 1360px`
- `--reading-max: 640px`

현재 의미 기준:

- landing: 넓게
- app: 중간
- writing / preview: 좁게

추가 레이아웃 토큰:

- `--sidebar-w: 240px`
- `--topbar-h: 64px`

### Grid Patterns

- `hero grid`
- `two-col section`
- `feature grid`
- `app shell grid`
- `manuscript narrow column`

## 7. Shadow Tokens

- `--shadow`
  - floating paper-like panel 그림자
  - 현재 값: `0 4px 24px rgba(35, 36, 37, 0.06), 0 24px 64px rgba(35, 36, 37, 0.05)`

원칙:

- 그림자는 가볍게
- 떠 있는 카드처럼 보이기보다 종이 한 장이 위에 놓인 느낌
- 강한 elevation 사용 금지
- 표면 분리는 그림자보다 배경 톤 차이를 우선한다

## 8. Component Mapping

### TopBar

사용 토큰:

- `--bg`
- `--text`
- `--text-muted`
- `--line`

### Sidebar

사용 토큰:

- `--surface-low`
- `--surface`
- `--text`
- `--text-faint`

### Primary Button

사용 토큰:

- `--text`
- `--surface`

### Secondary Button

사용 토큰:

- `--surface-mid`
- `--text`

### Writing Sheet / Hero Sheet

사용 토큰:

- `--surface`
- `--shadow`
- `--text`
- `--text-muted`

## 9. 현재 상태와 다음 단계

현재 상태:

- 색상 토큰은 CSS 변수로 존재
- 간격 토큰은 CSS 변수로 존재
- 타이포 토큰은 문서 기준 중심으로 관리
- 컴포넌트별 토큰 사용 원칙은 정리 시작 단계

다음 단계:

1. typography utility 또는 semantic class 정리
2. 공용 컴포넌트 추출 시 토큰만 사용하도록 통일
3. state token과 interaction token hover/focus 기준 추가

## 10. 최종 기준

좋은 토큰 시스템은 아래를 만족해야 한다.

- 새 화면을 만들 때 임의 값 추가가 줄어든다
- 리디자인할 때 토큰 수정만으로 방향 전환이 가능하다
- 여러 컴포넌트가 같은 시각 언어를 공유한다
