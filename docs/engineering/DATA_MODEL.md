# Book Maker Data Model

## 1. Purpose

This document defines the core data model direction for Book Maker.

The model is designed to support:

- the confirmed MVP
- the near-term roadmap
- later public reading and publishing features

The data model should stay simple in the MVP, but it should not block future expansion.

## 2. Modeling Principle

Book Maker is built around one core progression:

`Entry -> Draft -> Book -> Publication`

This progression is important because the product evolves from private writing to structured drafting and later to public reading and publishing.

Not every stage must be implemented now.

But the model should make those stages possible later.

## 3. Core Entities

The long-term model centers on these entities:

- `User`
- `Entry`
- `Draft`
- `DraftEntry`
- `Book`
- `BookChapter`
- `Attachment`
- `Publication`
- `EntryVersion`

For MVP implementation, only a subset is required immediately.

## 4. MVP Entities

### 4.1 User

Purpose:

- owns entries and drafts

Core fields:

- `id`
- `email`
- `displayName`
- `createdAt`
- `updatedAt`

Notes:

- even if profile features are minimal at first, ownership must be explicit

### 4.2 Entry

Purpose:

- the smallest meaningful writing unit in the product

Core fields:

- `id`
- `userId`
- `title`
- `body`
- `status`
- `createdAt`
- `updatedAt`
- `lastSavedAt`

Suggested status values:

- `draft`
- `completed`
- `archived`

Notes:

- `Entry` is the foundation of both archive and draft creation
- body content should remain in PostgreSQL in the MVP

### 4.3 Draft

Purpose:

- a user-curated collection of entries that begins to function like a manuscript

Core fields:

- `id`
- `userId`
- `title`
- `description`
- `status`
- `createdAt`
- `updatedAt`

Suggested status values:

- `active`
- `archived`

### 4.4 DraftEntry

Purpose:

- stores ordered relationships between entries and drafts

Core fields:

- `id`
- `draftId`
- `entryId`
- `position`
- `createdAt`

Notes:

- this is essential because ordering matters in a book draft

## 5. Future-Facing Entities

### 5.1 Book

Purpose:

- a public or publishable version derived from a draft

Why it should exist separately from Draft:

- `Draft` is an editing object
- `Book` is a reading or publishing object

Suggested fields:

- `id`
- `userId`
- `sourceDraftId`
- `title`
- `subtitle`
- `description`
- `visibility`
- `coverImageId`
- `publishedAt`
- `createdAt`
- `updatedAt`

Suggested visibility values:

- `private`
- `unlisted`
- `public`

### 5.2 BookChapter

Purpose:

- supports chapter-level grouping inside future book structures

Suggested fields:

- `id`
- `bookId`
- `title`
- `description`
- `position`
- `createdAt`
- `updatedAt`

Notes:

- this becomes useful once chapter-based authoring is introduced

### 5.3 Attachment

Purpose:

- supports image or file association with entries, drafts, or books

Suggested fields:

- `id`
- `userId`
- `type`
- `storageKey`
- `originalName`
- `mimeType`
- `size`
- `createdAt`

Notes:

- actual file binary should live in object storage later
- PostgreSQL stores metadata only

### 5.4 Publication

Purpose:

- stores export- or print-oriented publishing information

Suggested fields:

- `id`
- `bookId`
- `format`
- `trimSize`
- `bindingMargin`
- `bleed`
- `isbn`
- `status`
- `exportedAt`
- `createdAt`
- `updatedAt`

Notes:

- this is for Phase 5 and later

### 5.5 EntryVersion

Purpose:

- stores historical snapshots of entry content if version history is introduced later

Suggested fields:

- `id`
- `entryId`
- `title`
- `body`
- `versionNumber`
- `createdAt`

Notes:

- do not implement this in MVP unless version history becomes necessary early

## 6. Relationship Model

### Current MVP relationships

- one `User` has many `Entry`
- one `User` has many `Draft`
- one `Draft` has many `DraftEntry`
- one `Entry` can belong to many `Draft` through `DraftEntry`

### Future relationships

- one `Draft` may become one or more `Book`
- one `Book` may have many `BookChapter`
- one `Entry` may have many `EntryVersion`
- one `Entry`, `Draft`, or `Book` may reference `Attachment`
- one `Book` may have one or more `Publication` records

## 7. Recommended MVP Table Set

The first implementation should likely include:

- `users`
- `entries`
- `drafts`
- `draft_entries`

Optional early additions if auth and operational needs exist:

- `refresh_tokens` or equivalent token/session table depending on auth strategy

Tables intentionally deferred:

- `books`
- `book_chapters`
- `attachments`
- `publications`
- `entry_versions`

## 8. Content Ownership

Ownership must be explicit in all primary content.

This means:

- every `Entry` belongs to one `User`
- every `Draft` belongs to one `User`
- every future `Book` belongs to one `User`

This is necessary because the product starts as a private writing system.

## 9. Content Lifecycle

### MVP lifecycle

1. user creates an `Entry`
2. entry is stored and updated through autosave
3. user groups entries into a `Draft`
4. draft order is managed through `DraftEntry`
5. user previews draft as a book-like reading flow

### Future lifecycle

1. draft becomes shaped into a `Book`
2. book may gain chapters, cover, metadata, and attachments
3. book may be published publicly
4. book may be exported as EPUB or print-ready PDF

## 10. Why PostgreSQL Fits This Model

This model is primarily relational because:

- ownership is explicit
- ordering matters
- drafts and entries have many structured relationships
- later publication objects are metadata-rich and queryable

This is why PostgreSQL remains the main source of truth.

MongoDB is deferred because the current model does not require a second primary store.

## 11. Autosave Implication

Autosave does not require a separate content database.

The MVP should:

- update `Entry.body`
- update `updatedAt`
- update `lastSavedAt`

This keeps the model simple while still supporting a real writing workflow.

## 12. Future-Proofing Decisions

To support roadmap features later, the model should assume:

- `Draft` and `Book` are not the same object
- attachments should be metadata-driven
- publication/export is a later concern, not part of `Draft`
- version history should be additive, not mixed into the main entry table

## 13. Recommended Next Documents

The next engineering planning documents should be:

1. `BACKEND_API_PLAN.md`
2. `FRONTEND_APP_STRUCTURE.md`
3. `AUTH_FLOW.md`
