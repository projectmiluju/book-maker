# Book Maker Technical Decision Record

## 1. Purpose

This document explains why the Book Maker stack was selected.

These decisions were not made because the technologies are trendy or simply interesting to use.

They were made because the product needs them.

The principle is:

Use the simplest stack that supports the real product requirements of the MVP and leaves room for justified expansion later.

## 2. Confirmed Decisions

- Frontend: `Nuxt 3 + Vue 3`
- Backend: `NestJS`
- Main DB: `PostgreSQL`
- Cache/Auth: `Redis`
- Mobile: responsive web first, native app deferred
- MongoDB: explicitly deferred

## 3. Decision Philosophy

The stack was chosen by asking:

- What does the product need right now?
- What creates the lowest unnecessary complexity?
- What supports both product quality and delivery speed?
- What can be defended as an architecture choice, not a preference choice?

## 4. Why Nuxt 3 + Vue 3

This product needs both a public landing page and an interactive web application.

Nuxt was chosen because it supports:

- SEO-friendly landing pages
- structured app routing
- one coherent web product for both marketing and usage
- responsive web delivery without forcing a separate native app too early

Vue was chosen because the product is highly UI- and experience-driven, and the stack should remain efficient to build and maintain.

This decision was not made to "try Vue."

It was made because the product needs:

- a strong landing plus app combination
- a smooth content-focused UI layer
- low-friction implementation for interactive writing flows

## 5. Why NestJS

The product needs a structured backend for:

- auth
- writing APIs
- autosave
- draft management
- validation

NestJS was chosen because it provides:

- modular backend organization
- TypeScript-based consistency
- fast implementation for API-driven product development
- enough architectural discipline without the overhead of a heavier backend stack

This decision was not made to "use TypeScript everywhere."

It was made because the MVP needs a backend that is organized, scalable enough, and fast to deliver.

## 6. Why PostgreSQL

The product's core domain is relational.

The MVP needs to model:

- users
- entries
- drafts
- ordered relationships between drafts and entries

PostgreSQL was chosen because it is the best fit for:

- durable business data
- structured relationships
- predictable querying
- future filtering and search expansion

This decision was not made because PostgreSQL is popular.

It was made because the product's primary data model is relational by nature.

## 7. Why Redis

Redis was chosen for responsibilities that are clearly different from the primary database:

- token lifecycle support
- session-like short-lived state
- caching where useful later

This keeps PostgreSQL focused on durable data while Redis handles volatile or short-lived concerns.

This decision was not made to make the architecture look advanced.

It was made because auth and cache concerns are operationally distinct from the product's main writing data.

## 8. Why MongoDB Is Deferred

MongoDB was considered for JSON-heavy or document-oriented storage.

It is not included in the MVP because the current product does not yet require a second primary data store.

Adding MongoDB now would increase:

- system complexity
- data ownership ambiguity
- testing burden
- local development overhead

MongoDB may be introduced later only if the product develops a clear need for:

- non-relational document history
- large flexible payload storage
- document/event structures that do not fit the relational core

This means MongoDB is not rejected.

It is deliberately postponed until the product proves the need.

## 9. Why Native Mobile Is Deferred

The product is currently validating a writing and archive experience, not a device-specific experience.

A separate native mobile app would introduce:

- another frontend stack
- duplicate UX implementation effort
- additional testing and release overhead

For the MVP, the better decision is:

- responsive web first
- optional PWA later
- native mobile only after product need is proven

This decision was not made to avoid mobile forever.

It was made because the MVP needs focus more than platform breadth.

## 10. Final Decision Summary

The selected stack is justified because it directly supports the product's real needs:

- a strong public landing page
- a responsive writing web app
- a structured API backend
- durable relational storage
- short-lived auth and cache support
- room for later expansion without premature complexity

## 11. Fixed Technical Direction

Until product requirements materially change, the technical direction is fixed as:

- `Nuxt 3 + Vue 3`
- `NestJS`
- `PostgreSQL`
- `Redis`
- `MongoDB deferred`
- `native mobile deferred`
