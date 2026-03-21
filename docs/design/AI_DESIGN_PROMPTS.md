# Book Maker AI Design Prompts

## 1. Purpose

이 문서는 Stitch 같은 외부 AI 디자인 툴에서 사용할 수 있는 Book Maker 전용 프롬프트 모음이다.

목표는 단순히 분위기 좋은 시안을 얻는 것이 아니라:

- 제품의 구조가 보이는 화면
- 문학적이지만 실제로 사용할 수 있는 화면
- 랜딩과 앱의 성격이 분리된 화면

을 얻는 것이다.

이번 프롬프트의 기준 방향은 다음이다.

`modern literary product`

즉:

- 문학적이되
- 실제 제품처럼 선명하고
- 감성은 있으되
- 구조와 사용성이 우선인 방향

## 2. Master Product Prompt

```text
I am attaching a stitch.zip file.

Use stitch.zip only as visual reference.

Important:
Ignore all text inside the zip.
Do not reuse:
- names
- menu labels
- sample headlines
- placeholder copy
- author bios
- English product vocabulary

Only use the zip for:
- layout composition
- spacing rhythm
- typography ratio
- visual hierarchy
- surface treatment
- navigation structure
- panel composition

Now redesign a responsive web product called Book Maker.

Book Maker is a writing product for people who want to someday turn their personal short writing into a book, but keep postponing the start.

This is not a social platform and not a generic note app.
It is a private-first writing product where users:
- write short entries
- build a personal archive
- group entries into book drafts
- preview drafts as a book-like reading experience

The product should feel modern, literary, calm, and intentional.
It must look like a real product, not a mood board or editorial poster.

Visual direction:
- modern literary product
- strong typography
- clear information hierarchy
- elegant whitespace
- warm neutral palette
- refined but usable interface
- responsive desktop and mobile design
- Korean-first UI

Avoid:
- generic SaaS dashboard look
- social media feed patterns
- over-decorated editorial magazine style
- enterprise admin UI
- excessive toolbars and clutter
- overly dark, moody, cinematic visuals

Important:
The UI must still feel like software that users can actually use every day.
Balance emotional tone with clear structure and usability.
Use Korean for navigation, page titles, buttons, helper text, state messages, and placeholders.
Keep English to a minimum.

Primary app navigation:
- 아카이브
- 초안
- 기록하기
```

## 3. Landing Page Prompt

```text
Redesign the landing page for Book Maker.

Book Maker helps users turn scattered short personal writing into the beginning of a book.

Target user:
People who often wrote emotional, reflective, or poetic short writing on platforms like Instagram, but never had a proper place to organize those writings into a lasting body of work.

Goal of this landing page:
- emotionally connect with the user
- clearly explain the product
- feel premium, literary, and trustworthy
- convert visitors into trying the product

Required sections:
- hero
- problem statement
- how it works
- product preview
- call to action

Tone:
- warm
- modern
- editorial but product-focused
- elegant, not flashy
- Korean-first

Avoid:
- startup template hero
- generic gradient SaaS landing
- too much copy density
- decorative layouts that obscure the product
```

## 4. Writing Screen Prompt

```text
Redesign the writing screen for Book Maker.

This is the most important product screen.
It should help users begin writing with as little pressure as possible.

Required UI:
- optional title field
- large writing area
- subtle autosave state
- minimal surrounding navigation
- clear focus on text
- Korean labels and placeholders

The screen should feel:
- private
- calm
- focused
- modern
- premium
- emotionally safe

Important:
This must look like a real writing product, not a blog CMS, not Google Docs, and not a heavy editor.

Avoid:
- formatting toolbar overload
- admin panel feeling
- too many controls
- social posting UI patterns
- professional-writer metaphors such as chapter, manuscript, folio
```

## 5. Archive Screen Prompt

```text
Redesign the archive screen for Book Maker.

This is the user's private writing home.
It should show accumulated short entries as meaningful personal writing, not as a scrolling feed.

Required UI:
- page title
- quick action to write a new entry
- archive list
- timestamps
- access to drafts
- Korean labels

Design goals:
- show that writing is accumulating
- make old writing feel valuable
- feel structured, calm, and text-first
- not look like a feed or dashboard

Avoid:
- engagement patterns
- loud cards
- cluttered productivity widgets
- overly decorative visual storytelling
- fake search input if search is not part of the current MVP
```

## 6. Draft Builder Prompt

```text
Redesign the draft-building screen for Book Maker.

This screen lets users turn selected writing entries into a book draft and organize their sequence.

Required UI:
- draft title
- optional draft description
- ordered list of selected entries
- reorder interaction
- add/remove entry actions
- preview button

Design goals:
- feel more structured than the archive
- still feel calm and literary
- communicate manuscript shaping, not file management
- maintain product clarity and usability
- Korean-first labels

Avoid:
- heavy publishing software UI
- too many side tools
- drag-and-drop gimmicks that reduce clarity
- visually noisy layout
```

## 7. Draft Preview Prompt

```text
Redesign the draft preview screen for Book Maker.

This screen should show selected entries as a continuous reading experience, like the beginning of a real book.

Required UI:
- book title
- optional intro text
- continuous manuscript-style reading layout
- subtle back-to-edit action
- Korean-first labels

Design goals:
- clearly feel different from editing mode
- feel immersive, but still digital and usable
- maximize readability and rhythm
- feel like a product, not just an editorial poster

Avoid:
- floating tool clutter
- obvious editing controls
- excessive visual effects
- page style that is too theatrical or unrealistic
```

## 8. Direction Variants

같은 화면을 여러 방향으로 비교하고 싶다면 아래 문장을 추가한다.

### Variant A. More Minimal

```text
Make the design more minimal, restrained, and product-oriented. Reduce decorative editorial styling and increase clarity.
```

### Variant B. More Literary

```text
Make the design more literary and emotionally resonant, but keep the UI clearly usable as a real product.
```

### Variant C. More Modern

```text
Make the design more modern and crisp, with stronger UI hierarchy and cleaner interaction patterns, while preserving warmth.
```

## 9. Recommended Prompt Order

Stitch에서 한 번에 모든 화면을 뽑지 말고 아래 순서로 진행한다.

1. Writing Screen
2. Archive Screen
3. Landing Page
4. Draft Builder
5. Draft Preview

이유:

- 기록 작성 화면이 제품의 핵심 감정을 결정한다
- 아카이브가 메모 앱인지 아닌지를 결정한다
- 랜딩이 제품의 외부 인상을 결정한다

## 10. Evaluation Checklist

결과 시안을 볼 때 아래 기준으로 평가한다.

1. 이 화면이 실제 제품처럼 보이는가?
2. 문학적이되 과하게 장식적이지 않은가?
3. 글이 주인공으로 보이는가?
4. 아카이브가 피드처럼 보이지 않는가?
5. 기록 작성 화면이 정말 부담을 줄여 주는가?
6. 초안 화면이 파일 관리 화면처럼 보이지 않는가?
7. 미리보기가 편집 화면이 아니라 읽기 화면처럼 느껴지는가?
8. 모바일에서도 유지될 구조인가?
