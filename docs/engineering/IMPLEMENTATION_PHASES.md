# Book Maker Implementation Phases

## 1. Purpose

This document defines the practical implementation order for the Book Maker MVP.

Its purpose is to turn product planning into execution order.

The sequence should reduce risk, preserve momentum, and ensure that each phase produces something testable.

## 2. Implementation Principle

The MVP should not be built screen by screen in isolation.

It should be built by validating the product's core loop in the right order:

1. can the system run?
2. can the user authenticate?
3. can the user write?
4. can the user revisit writing?
5. can the user shape a draft?
6. can the user feel the book experience?
7. can the public product story support the app?

## 3. Phase Overview

### Phase 0. Project Foundation

Goal:

- establish the codebase and technical baseline

### Phase 1. Backend Foundation

Goal:

- make the API and persistence layer operational

### Phase 2. Auth Foundation

Goal:

- enable secure private writing access

### Phase 3. Core Entry Flow

Goal:

- let users create, edit, and autosave writing

### Phase 4. Archive Flow

Goal:

- let users view and revisit their writing

### Phase 5. Draft Flow

Goal:

- let users group entries into drafts

### Phase 6. Preview Experience

Goal:

- make drafts feel like the beginning of a book

### Phase 7. Landing And Product Polish

Goal:

- communicate the product clearly and prepare for presentation

## 4. Phase 0. Project Foundation

### Objectives

- initialize frontend project with Nuxt 3
- initialize backend project with NestJS
- prepare environment configuration
- define shared local development rules

### Deliverables

- frontend app bootstrapped
- backend app bootstrapped
- env file structure defined
- lint/format/test baseline defined
- local run instructions documented

### Exit Criteria

- frontend and backend both run locally
- PostgreSQL and Redis connection strategy is confirmed

## 5. Phase 1. Backend Foundation

### Objectives

- connect backend to PostgreSQL
- connect backend to Redis
- define schema and migration baseline
- implement health check

### Deliverables

- DB schema migrated
- Redis integration baseline
- health endpoint working
- backend module skeleton created

### Recommended Tasks

- create base Nest modules
- configure ORM or query layer
- create initial migrations
- add health endpoint

### Exit Criteria

- backend can connect to PostgreSQL
- backend can connect to Redis
- health endpoint returns success

## 6. Phase 2. Auth Foundation

### Objectives

- implement signup, login, refresh, logout, and current-user bootstrap

### Deliverables

- auth endpoints working
- JWT flow working
- Redis-backed refresh token control working
- protected route guard working

### Recommended Tasks

- implement user creation
- implement password hashing
- implement login token issuance
- implement refresh flow
- implement auth guard
- implement `/auth/me`

### Exit Criteria

- user can sign up and log in
- protected endpoints reject unauthorized access
- refresh flow works correctly

## 7. Phase 3. Core Entry Flow

### Objectives

- implement the product's most important flow: writing

### Deliverables

- create entry API
- update entry API
- delete entry API
- entry create/edit UI
- autosave feedback in UI

### Recommended Tasks

- build entry form page
- connect create/update requests
- implement debounced autosave
- show saving/saved/failed states

### Exit Criteria

- user can create an entry
- user can continue editing it
- autosave works reliably

## 8. Phase 4. Archive Flow

### Objectives

- let users see accumulated writing as a meaningful archive

### Deliverables

- archive list API
- entry detail API
- archive page UI
- entry detail page UI

### Recommended Tasks

- build archive list page
- show previews and timestamps
- connect entry detail view
- optionally add basic search if still simple

### Exit Criteria

- user can browse their entries
- user can open and revisit past writing

## 9. Phase 5. Draft Flow

### Objectives

- let users turn entries into structured drafts

### Deliverables

- draft CRUD API
- add entries to draft API
- reorder entries API
- draft list UI
- draft create UI
- draft detail UI

### Recommended Tasks

- create draft list page
- create draft creation flow
- implement entry selection
- implement reorder interaction

### Exit Criteria

- user can create a draft
- user can attach entries to it
- user can reorder entries

## 10. Phase 6. Preview Experience

### Objectives

- make the draft feel like a book beginning

### Deliverables

- preview data endpoint
- preview page UI
- reading-focused layout

### Recommended Tasks

- create draft preview route
- build reading layout
- ensure transition from draft editing to preview feels meaningful

### Exit Criteria

- user can preview a draft as continuous reading content
- preview feels distinct from list and edit views

## 11. Phase 7. Landing And Product Polish

### Objectives

- complete the public-facing product story
- make the product portfolio-ready

### Deliverables

- landing page
- clear messaging
- CTA flow
- responsive refinements
- polish across core app screens

### Recommended Tasks

- write landing copy
- design hero and product sections
- connect signup/login CTA
- refine mobile layout

### Exit Criteria

- public product value is clear
- private app experience is coherent
- project is ready for demo or portfolio presentation

## 12. Suggested Work Sequence Summary

Recommended exact order:

1. Nuxt and Nest bootstrapping
2. PostgreSQL and Redis setup
3. backend health and migrations
4. auth
5. entry create/edit/autosave
6. archive
7. drafts
8. preview
9. landing and polish

## 13. What Not To Do Early

Avoid these before the MVP loop is working:

- image upload
- public reading pages
- PDF export
- plagiarism tools
- chapter automation
- AI writing features
- native mobile work

## 14. MVP Completion Definition

The MVP is complete when:

- a user can sign up
- a user can log in
- a user can create and autosave entries
- a user can browse their archive
- a user can create and organize a draft
- a user can preview that draft as a book-like reading flow
- the product has a clear landing page

## 14.1 Current Repository Status

The current repository has completed the MVP definition above.

Implemented status:

- Phase 0 through Phase 7 deliverables are connected in the real application
- the private core loop `write -> archive -> draft -> preview` is testable end to end
- landing and app entry flows are connected
- Playwright smoke and auth-expiry smoke support CI quality gating

From this point, new product work should default to Phase 2 unless a true MVP regression or closeout gap is discovered.

## 14.2 Phase 2 Entry Criteria

Phase 2 work should start only when:

- the MVP loop remains green in current CI quality gates
- remaining MVP tasks are clearly identified as non-blocking polish
- new work strengthens private writing depth or archive intelligence without expanding into later roadmap phases

## 15. Recommended Next Documents

The next planning documents should be:

1. `DESIGN_PRINCIPLES.md`
2. `API_RESPONSE_CONVENTIONS.md`
3. `DEV_SETUP.md`
