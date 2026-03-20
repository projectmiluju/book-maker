# Book Maker Backend API Plan

## 1. Purpose

This document defines the backend API direction for the Book Maker MVP.

The API should support:

- writing entries
- autosave
- archive browsing
- draft creation and organization
- authentication foundations

It should also leave room for later public book and publishing features.

## 2. API Style

Recommended style:

- REST API
- JSON request and response bodies
- token-based authentication

Why:

- the MVP domain is clear and resource-oriented
- frontend and backend are separated
- the product needs predictable CRUD plus ordering workflows

## 3. Initial Resource Domains

The MVP backend should be organized around:

- `auth`
- `users`
- `entries`
- `drafts`
- `health`

## 4. Auth API

### Purpose

- allow secure user access to personal writing data
- support token-based session flow

### Suggested endpoints

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Notes

- access token for API calls
- refresh token lifecycle can be backed by Redis
- `/auth/me` gives frontend session bootstrap information

## 5. User API

### Purpose

- support basic account identity needs

### Suggested endpoints

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Notes

- keep user profile scope minimal in MVP

## 6. Entry API

### Purpose

- support private writing, editing, archive retrieval, and autosave

### Suggested endpoints

- `POST /api/v1/entries`
- `GET /api/v1/entries`
- `GET /api/v1/entries/:entryId`
- `PATCH /api/v1/entries/:entryId`
- `DELETE /api/v1/entries/:entryId`

### Entry Create

`POST /api/v1/entries`

Purpose:

- create a new writing entry

Suggested request fields:

- `title`
- `body`
- `status`

Suggested response:

- created entry object

### Entry List

`GET /api/v1/entries`

Purpose:

- fetch archive items

Suggested query params:

- `page`
- `limit`
- `sort`
- `q`
- `status`

Suggested response:

- paginated list of entries

### Entry Detail

`GET /api/v1/entries/:entryId`

Purpose:

- fetch one entry in full

### Entry Update

`PATCH /api/v1/entries/:entryId`

Purpose:

- update title/body/status
- support autosave behavior

Suggested request fields:

- `title`
- `body`
- `status`

Suggested response:

- updated entry object
- last saved timestamp

### Entry Delete

`DELETE /api/v1/entries/:entryId`

Purpose:

- remove one entry from active archive

MVP note:

- soft delete may be considered later
- hard delete is acceptable for initial MVP if the UX is clear

## 7. Autosave API Behavior

Autosave should not require a separate endpoint in the MVP.

Recommended approach:

- use `PATCH /api/v1/entries/:entryId`

Why:

- autosave is still a normal update operation
- keeping one update contract reduces complexity

Optional future pattern:

- add autosave-specific metadata if conflict handling becomes necessary

## 8. Draft API

### Purpose

- support grouping entries into book drafts
- manage draft metadata
- manage draft ordering

### Suggested endpoints

- `POST /api/v1/drafts`
- `GET /api/v1/drafts`
- `GET /api/v1/drafts/:draftId`
- `PATCH /api/v1/drafts/:draftId`
- `DELETE /api/v1/drafts/:draftId`
- `POST /api/v1/drafts/:draftId/entries`
- `PATCH /api/v1/drafts/:draftId/entries/reorder`
- `DELETE /api/v1/drafts/:draftId/entries/:entryId`
- `GET /api/v1/drafts/:draftId/preview`

### Draft Create

`POST /api/v1/drafts`

Purpose:

- create a draft with title and optional description

Suggested request fields:

- `title`
- `description`
- `entryIds`

### Draft List

`GET /api/v1/drafts`

Purpose:

- fetch all drafts for the current user

### Draft Detail

`GET /api/v1/drafts/:draftId`

Purpose:

- fetch one draft with ordered entries

### Draft Update

`PATCH /api/v1/drafts/:draftId`

Purpose:

- update draft title or description

### Draft Delete

`DELETE /api/v1/drafts/:draftId`

Purpose:

- delete one draft

### Add Entries To Draft

`POST /api/v1/drafts/:draftId/entries`

Purpose:

- attach one or more entries to an existing draft

Suggested request fields:

- `entryIds`

### Reorder Draft Entries

`PATCH /api/v1/drafts/:draftId/entries/reorder`

Purpose:

- update ordered positions of entries inside the draft

Suggested request fields:

- `items: [{ entryId, position }]`

### Remove Entry From Draft

`DELETE /api/v1/drafts/:draftId/entries/:entryId`

Purpose:

- remove an entry from one draft without deleting the original entry

### Draft Preview

`GET /api/v1/drafts/:draftId/preview`

Purpose:

- return a reading-oriented representation of the draft

MVP note:

- this can initially return the same underlying content as draft detail
- frontend presentation can do most of the preview work

## 9. Health API

### Suggested endpoint

- `GET /api/v1/health`

Purpose:

- confirm service availability
- useful for deployment and operations checks

## 10. Response Principles

Recommended response style:

- consistent envelope or consistent direct resource structure
- explicit timestamps where useful
- clear validation errors

Suggested fields in resource responses:

- `id`
- domain data
- `createdAt`
- `updatedAt`

For autosave-sensitive resources:

- `lastSavedAt`

## 11. Security Principles

- all entry and draft resources must be user-scoped
- a user must never access another user's private content by ID alone
- auth must be required for all private resource APIs
- request validation should be strict

## 12. Future API Expansion

The API should later expand into these domains:

- `books`
- `attachments`
- `publications`
- `comments`
- `analytics`
- `ai`

These are intentionally not part of the MVP API surface.

## 13. Recommended Backend Module Mapping

- `AuthModule`
- `UsersModule`
- `EntriesModule`
- `DraftsModule`
- `HealthModule`

Future modules:

- `BooksModule`
- `AttachmentsModule`
- `PublicationsModule`
- `AiModule`

## 14. Suggested Build Order

1. health
2. auth
3. entries
4. drafts
5. preview response shaping

## 15. Next Documents

The next implementation planning documents should be:

1. `AUTH_FLOW.md`
2. `FRONTEND_APP_STRUCTURE.md`
3. `DB_SCHEMA_PLAN.md`
