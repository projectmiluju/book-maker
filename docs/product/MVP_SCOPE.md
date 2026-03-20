# Book Maker MVP Scope

## 1. Scope Goal

This document defines what the first MVP must include, what it may include if time allows, and what it must explicitly exclude.

The purpose is to protect the product from becoming a generic memo app or an overly ambitious publishing platform.

## 2. MVP Definition

The first MVP succeeds if a user can:

1. write short entries quickly
2. revisit those entries in an organized archive
3. group selected entries into a simple draft
4. feel that their writing is becoming the beginning of a book

The MVP does not need to support publishing, collaboration, or advanced editing workflows.

## 3. In Scope

### 3.1 Entry Creation

Must include:

- create a new writing entry
- optional title
- body text
- automatic created date
- edit saved entry
- delete saved entry

Why this matters:

- without fast entry creation, the product fails at the first user need

### 3.2 Archive

Must include:

- entry list view
- chronological sorting
- entry preview
- entry detail view

Why this matters:

- the archive is what separates the product from disposable SNS writing

### 3.3 Draft Creation

Must include:

- create a draft from selected entries
- draft title
- optional draft description
- save draft

Why this matters:

- the product must clearly bridge writing fragments and a book draft

### 3.4 Draft Organization

Must include:

- view all drafts
- open one draft
- reorder included entries
- remove entries from a draft

Why this matters:

- a draft must feel editable enough to be useful

### 3.5 Draft Preview

Must include:

- book-like preview layout
- continuous reading flow
- visible draft title

Why this matters:

- this is the emotional proof point of the MVP

## 4. Nice To Have

These features may be included if implementation remains simple and does not delay the MVP.

- tags on entries
- simple text search
- mood or theme labels
- archive filter by tag or date
- draft cover subtitle or introduction

These are useful, but not essential to proving the core product thesis.

## 5. Out of Scope

The following are explicitly excluded from the first MVP:

- user accounts and social profiles
- SNS import integrations
- collaboration features
- public sharing or publishing
- export to commercial print workflows
- payment or subscriptions
- AI writing generation
- AI auto-grouping into chapters
- advanced rich-text editor features
- comments, likes, or community features

## 6. Product Boundaries

To keep the MVP sharp:

- it should not behave like a social feed
- it should not require full manuscript writing from day one
- it should not become a professional publishing suite

The product should remain centered on:

- quick writing
- meaningful accumulation
- lightweight book drafting

## 7. Risk Of Scope Creep

The biggest scope risks are:

1. adding too many archive management features before validating writing behavior
2. adding advanced editor features before validating draft creation value
3. adding AI too early instead of first proving the archive-to-draft workflow
4. over-designing export before users even create meaningful drafts

## 8. Build Priority

Recommended implementation priority:

1. entry creation
2. archive
3. draft creation
4. draft organization
5. draft preview

If time becomes limited, the product must still preserve this sequence.

## 9. Release Readiness Check

The MVP is ready for internal testing when a user can:

- write at least three entries
- find those entries again
- select them into a draft
- reorder them
- preview them as one reading flow

If any of these actions fail or feel confusing, the MVP is not ready.

## 10. Next Documents

The next PM document should be:

1. `SUCCESS_METRICS.md`
