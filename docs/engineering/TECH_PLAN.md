# Book Maker Tech Plan

## 1. Purpose

This document defines the confirmed technical plan for the Book Maker MVP.

The goal is to align product scope, user experience, and engineering implementation into one practical delivery plan.

This stack is selected for product fit, implementation clarity, and phased expansion.

## 2. Confirmed Stack

- Frontend: `Nuxt 3 + Vue 3`
- Backend: `NestJS`
- Main DB: `PostgreSQL`
- Cache/Auth: `Redis`
- Mobile Strategy: `responsive web first`, `PWA optional`, native mobile deferred
- Deferred DB: `MongoDB` reserved for later only if a clear non-relational need emerges

## 3. Architecture Overview

The MVP will be built as a separated frontend and backend architecture.

### Frontend

`Nuxt 3 + Vue 3`

Responsibilities:

- public landing page
- product introduction and CTA flows
- authenticated app UI
- entry writing experience
- archive browsing
- draft creation and preview

### Backend

`NestJS`

Responsibilities:

- REST API
- authentication and authorization
- autosave endpoints
- entry and draft domain logic
- validation
- integration with PostgreSQL and Redis

### Data Layer

`PostgreSQL`

Responsibilities:

- users
- entries
- drafts
- draft-entry ordering relationships
- durable business data

`Redis`

Responsibilities:

- refresh token/session support
- short-lived auth and cache use cases
- optional rate limiting or temporary state acceleration

## 4. Product Structure

Recommended route structure:

- `/`
- landing page
- `/app`
- authenticated writing application
- `/app/archive`
- entry archive
- `/app/entries/new`
- create entry
- `/app/entries/:id`
- view or edit entry
- `/app/drafts`
- draft list
- `/app/drafts/new`
- create draft
- `/app/drafts/:id`
- organize draft
- `/app/drafts/:id/preview`
- draft preview

## 5. Frontend Plan

### Why Nuxt 3

Nuxt is used because the product needs both:

- a branded public landing experience
- an interactive writing application

Nuxt supports:

- SSR and SEO for landing pages
- strong routing and page structure for the app
- a smooth way to keep landing and application in one web product
- responsive-first implementation for mobile web use

### Frontend Responsibilities

The frontend should implement:

- landing page storytelling
- archive-first app navigation
- fast writing UI
- autosave feedback
- draft organization experience
- book-like preview presentation

### Frontend Principles

- mobile-responsive by default
- minimal friction on writing flows
- visual distinction between archive mode and draft mode
- clear transition from short entry to book draft

## 6. Backend Plan

### Why NestJS

NestJS is used because the product needs a structured API backend without introducing excessive complexity.

NestJS supports:

- modular service architecture
- TypeScript-based development
- fast delivery for CRUD plus auth workloads
- maintainable validation and domain separation

### Backend Responsibilities

- auth APIs
- user profile or identity handling if needed later
- entry create, update, delete, fetch APIs
- draft create, update, reorder, preview data APIs
- autosave support
- token lifecycle with Redis-backed flows

### Suggested Modules

- `auth`
- `users`
- `entries`
- `drafts`
- `health`

## 7. Data Model Direction

### Core Entities

- `User`
- `Entry`
- `Draft`
- `DraftEntry`

### Model Intent

`Entry` is the core writing unit.

`Draft` is a curated grouping of entries.

`DraftEntry` exists to preserve ordered relationships between entries inside a draft.

This is why a relational database is the primary store.

## 8. Autosave Strategy

The writing experience should feel continuously saved without forcing manual save behavior.

Recommended MVP approach:

1. local input state updates immediately
2. frontend triggers debounced autosave
3. backend updates or creates entry state
4. PostgreSQL stores durable content
5. frontend shows last saved feedback

Optional safety layer:

- temporary local fallback if network save fails

## 9. Auth And Session Strategy

Recommended approach:

- access token for API authorization
- refresh token lifecycle supported with Redis
- Redis used for session or token control where short-lived state is useful

Redis is included because token and cache responsibilities are clearly separate from primary business data.

## 10. Mobile Strategy

The MVP will not ship a separate native mobile app first.

Instead:

- the web app must work well on mobile screens
- mobile writing and reading flows must be first-class in responsive design
- PWA may be added if needed

Native mobile is deferred until the product proves that a separate app is necessary.

## 11. MongoDB Position

MongoDB is intentionally not part of the MVP implementation.

It is reserved for future use only if the product later develops a clear need for:

- large non-relational document storage
- flexible document history models
- AI-generated or event-like document payloads that do not fit the relational core cleanly

Until that need is proven, PostgreSQL remains the single source of truth for business data.

## 12. Suggested Delivery Phases

### Phase 1. Foundation

- Nuxt app shell
- NestJS API skeleton
- PostgreSQL connection
- Redis connection
- auth foundation

### Phase 2. Core Writing Flow

- create entry
- archive list
- entry detail and edit
- autosave behavior

### Phase 3. Draft Flow

- create draft
- select entries
- reorder draft entries
- draft preview

### Phase 4. Landing And Product Polish

- public landing page
- product storytelling
- onboarding copy refinement
- responsive QA

## 13. Technical Priority

The engineering priority order is:

1. data model clarity
2. writing flow reliability
3. archive usability
4. draft creation experience
5. preview quality
6. landing page polish

## 14. Final Technical Direction

Book Maker will be built as:

- a Nuxt-based web product
- powered by a NestJS API
- using PostgreSQL as the primary database
- using Redis for token, session, and cache concerns
- with MongoDB explicitly deferred until a real product need justifies it
