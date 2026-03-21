# 안녕, 나의 바다 Design System

## 1. 목적

이 문서는 `안녕, 나의 바다`의 실제 구현에 사용할 디자인 시스템 기준을 정의한다.

이 문서는 다음을 위해 존재한다.

- Stitch 시안에서 무엇을 가져가고 무엇을 버릴지 고정
- 실제 Nuxt 구현 시 화면마다 스타일이 흔들리지 않게 함
- 감성적 방향과 제품적 명확성을 동시에 유지

## 2. 디자인 방향 결론

`안녕, 나의 바다`의 시각 방향:

`구조는 선명하게 · 온도는 문학적으로 · 언어는 한국어 우선`

- 구조와 위계는 선명해야 한다
- 너무 차갑지 않게 문학적 온도를 가진다
- 잡지 편집물처럼 과장되지 않는다
- 실제로 매일 쓸 수 있는 제품 UI여야 한다
- 모든 UI 언어는 한국어를 기본으로 한다

## 3. 참고한 Stitch 방향

가져갈 것:

- 페이퍼 시트 중심 작성 화면
- 좌측 고정 사이드바 + 상단바의 이중 구조
- 톤 기반 표면 분리 (sidebar: surface-low / main: surface)
- 큰 제목과 좁은 읽기 폭 중심의 위계
- 페이지 하단 메타데이터 마감 방식 (archive-folio)
- dot-status 패턴 (저장 상태 표시)
- 랜딩 히어로의 종이 시트 미리보기

버릴 것:

- 3패널 작성 레이아웃 (writer-side 우측 패널)
- 벤토형 아카이브 카드 계층
- 과한 장식용 배너/이미지 블록
- 영어 제품 용어 (Chapter, Manuscript, Folio, Library, Current work 등)
- 가짜 이미지 플레이스홀더 (gradient image block)

## 4. 핵심 디자인 원칙

### 4.1 글이 가장 먼저 보여야 한다

- 본문은 가장 넓고 조용한 영역에 놓는다
- 보조 정보는 주변으로 밀어낸다
- 컨트롤은 최소한으로만 드러낸다

### 4.2 구조는 선명해야 한다

- 제목, 설명, 본문, 메타데이터의 계층이 분명해야 한다
- 사용자는 지금 어디에 있는지 즉시 알 수 있어야 한다
- 랜딩 / 아카이브 / 기록하기 / 초안 / 미리보기가 서로 다른 모드처럼 보여야 한다

### 4.3 감정은 색이 아니라 여백과 타이포에서 온다

- 과한 장식이나 강한 색 대비로 감정을 만들지 않는다
- 타이포그래피, 간격, 정렬, 배경 톤 차이로 분위기를 만든다

### 4.4 한국어 우선

- 내비게이션, 버튼, 레이블, 상태 메시지, 플레이스홀더는 모두 한국어
- 영어는 불가피한 기술 용어와 제한적인 브랜드 해석 문장에만 사용
- "Library", "Manuscripts", "Current work" 등 Stitch에서 온 영어 용어는 전면 금지

## 5. 색상 시스템

| 토큰            | 값                    | 용도                             |
| --------------- | --------------------- | -------------------------------- |
| `--bg`          | `#f7f4ef`             | 전체 앱 기본 배경                |
| `--surface`     | `#fffdfa`             | 패널, 카드, 페이퍼 시트          |
| `--surface-low` | `#f2eee7`             | sidebar, 구분 영역               |
| `--surface-mid` | `#ebe6de`             | 버튼 secondary, 구분 배경        |
| `--text`        | `#232425`             | 주 본문 텍스트                   |
| `--text-muted`  | `#666760`             | 보조 설명                        |
| `--text-faint`  | `#8a8a82`             | 메타데이터, eyebrow, 상태        |
| `--line`        | `rgba(35,36,37,0.08)` | 기본 구분선                      |
| `--line-strong` | `rgba(35,36,37,0.16)` | 강조 구분선, feature-item border |
| `--accent`      | `#1f2e45`             | 링크 hover, 강조                 |

원칙:

- 색상은 구조 역할만 한다
- 강렬한 accent 사용 금지
- "No-line rule": 섹션 구분은 선보다 배경 톤 변화로

## 6. 타이포그래피 시스템

| 역할                      | 크기                     | 특성                            |
| ------------------------- | ------------------------ | ------------------------------- |
| Display (랜딩 히어로)     | clamp(48px, 6vw, 88px)   | weight 800, tracking -0.05em    |
| Page Title (앱 화면)      | clamp(40px, 4vw, 64px)   | weight 800, tracking -0.05em    |
| Draft/Preview Title       | clamp(42px, 5vw, 70px)   | weight 800, tracking -0.05em    |
| Writer Title              | clamp(40px, 4vw, 64px)   | weight 800, tracking -0.05em    |
| Section Title (랜딩)      | clamp(32px, 4vw, 58px)   | weight 800, tracking -0.04em    |
| Archive Item Title        | 18px                     | weight 700, tracking -0.03em    |
| Sequence Title            | 20px                     | weight 700, tracking -0.03em    |
| Body (lede, section-copy) | 18–19px                  | weight 400, leading 1.72–1.75   |
| Writing Body              | clamp(18px, 1.8vw, 22px) | weight 400, leading 1.95        |
| Manuscript Reading        | clamp(20px, 2.2vw, 26px) | weight 400, leading 1.9         |
| Meta / Label / Eyebrow    | 11–12px                  | uppercase, tracking 0.14–0.16em |

폰트 스택: `"Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`

원칙:

- 한글 제품이므로 기본 폰트는 한국어 가독성이 좋은 sans-serif로 통일
- 문학적 분위기는 세리프 폰트가 아니라 크기, 간격, 폭 제한으로 만든다
- 페이지 제목은 강하게, 본문은 조용하게 유지한다

## 7. 레이아웃 시스템

### 기본 구조

1. **Landing Layout** (`default.vue` layout)
   - 넓은 container (max 1200px)
   - hero-grid: 1fr / 1fr
   - section 수직 패딩: 120px 전후
   - 히어로 우측에는 실제 기록 예시를 담은 paper-panel 배치

2. **App Shell Layout** (`app.vue` layout)
   - topbar + sidebar + main 3영역 구조
   - app-grid: `240px minmax(0, 1fr)`
   - sidebar 고정 (desktop), 모바일에서 숨김
   - app-main: padding 48px 56px 96px

3. **Writer Layout** (write.vue)
   - writer-grid: `240px minmax(0, 1fr)` (2-col, 3-col 아님)
   - writer-main: flex center
   - writer-sheet: max-width 760px, 내부 읽기 폭은 620px 전후로 유지
   - writer-sheet는 떠 있는 카드가 아니라 얇은 종이 한 장처럼 보이게 함

4. **Manuscript Layout** (preview.vue)
   - preview-shell: max-width 640px (reading-max)
   - 좌우 여백으로 읽기 최적 폭 제한

### 폭 기준

- `--container-max: 1200px` — 랜딩
- `--app-max: 1360px` — 앱 셸
- `--reading-max: 640px` — 미리보기/읽기 본문

## 8. 간격 시스템

| 토큰         | 값   | 주 용도               |
| ------------ | ---- | --------------------- |
| `--space-3`  | 12px | 버튼 gap, 소요소 간격 |
| `--space-4`  | 16px | 작은 내부 패딩        |
| `--space-5`  | 24px | 목록 아이템 패딩      |
| `--space-6`  | 32px | 섹션 내부 간격        |
| `--space-7`  | 40px | 컴포넌트 간 여백      |
| `--space-8`  | 56px | 주요 섹션 여백        |
| `--space-9`  | 72px | hero/preview 패딩     |
| `--space-10` | 96px | 섹션 padding          |

원칙: 구분선보다 공간으로 구획을 나눈다. 빡빡하면 spacing을 늘린다.

## 9. 컴포넌트 원칙

### 버튼

- `button-primary`: `--text` 배경, `--surface` 텍스트
- `button-secondary`: `--surface-mid` 배경
- `button-ghost`: 테두리 있음, 배경 없음
- `button-inv`: 어두운 배경 위 밝은 버튼 (cta-band 내부)

### 페이퍼 시트 (writer-sheet)

- `--surface` 배경
- ambient shadow (`--shadow`)
- 내부 패딩 40px 48px
- 배경 구분: writer-main은 배경 없음 (--bg 상속)

### 아카이브 목록

- 벤토 그리드 금지 — 모든 기록은 동등한 시각 무게
- flat list, 월별 그룹핑
- 각 항목: 날짜(고정 96px) + 제목/미리보기
- hover: 제목 색상 전환 (--accent)
- 검색/필터 입력은 현재 MVP에서 숨김
- 아카이브 상단은 별도 hero 카드 없이 page header로 시작

### Folio 컴포넌트 (archive-folio)

- 페이지 하단 중앙
- `::before` / `::after` 40px 선 + 텍스트
- 11px uppercase, `--text-faint`

### dot-status

- 저장 상태 표시
- `::before` 5px 원 (opacity 0.35)
- "자동 저장 중 / 자동 저장됨"

## 10. 화면별 핵심 규칙

### 랜딩

- 히어로 패널: 실제 서비스 기록 예시 표시 (Korean content)
- 히어로 좌측은 강한 한글 헤드라인, 우측은 paper-panel
- "Chapter", "Folio", "Manuscript" 등 전문 작가 용어 금지
- CTA band: 어두운 배경 + 조용한 한국어 문구

### 기록 작성

- 2-column (sidebar + canvas), 3-column 금지
- canvas 상단: 날짜 + dot-status (자동 저장 중)
- canvas 하단: 글자 수 + 개인 공간 안내 문구
- placeholder는 부드럽고 짧게
- 서식 툴바는 기본 비노출

### 아카이브

- flat chronological list
- 월 헤더 → 기록 목록
- 검색은 미래 기능 (현재 fake input 금지)
- archive-folio로 마무리

### 초안

- draft-hero: 초안 제목 편집 + 설명 + 메타 + 액션 버튼
- sequence-list: 순서 번호 + 제목 + 미리보기 + 날짜
- "초안 순서" 레이블은 sequence-header 클래스

### 미리보기

- preview-shell 680px 읽기 컬럼
- 기록 제목은 `manuscript h2` (11px uppercase faint)
- 본문 26px 내외, leading 1.9
- `manuscript-sep` 로 기록 간 구분 ("· · ·")
- 하단: preview-end (미리보기 끝 + 다시 다듬기)

## 11. 금지 목록

- 강조 카드가 섞인 `archive-grid` / `archive-hero` 패턴 금지
- `writer-side` (3번째 패널) 사용 금지
- `showcase-band`, `image-block` 사용 금지
- 영어 nav 라벨: Library, Manuscripts, Write, Current work 금지
- Stitch 참조 텍스트를 UI 카피로 사용 금지
- 전문 출판 용어를 MVP UI 레이블로 사용 금지

## 12. 구현 우선순위

1. 기록 작성 (write.vue)
2. 아카이브 (archive.vue)
3. 랜딩 (index.vue)
4. 초안 (drafts.vue)
5. 미리보기 (preview.vue)
