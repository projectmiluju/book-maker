# Book Maker Information Architecture

## 1. Purpose

This document defines how information, screens, and core objects are organized in the Book Maker MVP.

The purpose of IA is to make the product structurally clear before visual design and implementation begin.

It answers:

- what the main areas of the product are
- how users move between them
- how core content objects relate to each other
- where each action should live

## 2. IA Principle

Book Maker should be structured around one central idea:

The user is building a personal writing archive that can grow into a book draft.

Because of that, the product should not be organized like:

- a social platform
- a file manager
- a professional publishing suite

It should instead be organized around a lightweight progression:

`Write -> Archive -> Draft -> Preview`

## 3. Core Content Objects

The MVP has two main content objects and one supporting action space.

### 3.1 Entry

Definition:

- a single short piece of writing

Purpose:

- capture a thought, memory, scene, feeling, or reflection

Typical attributes:

- title
- body
- created date
- updated date
- optional tags

### 3.2 Draft

Definition:

- a grouped collection of entries arranged as the beginning of a book

Purpose:

- turn multiple separate entries into a coherent reading structure

Typical attributes:

- draft title
- optional description
- ordered list of entries
- created date
- updated date

### 3.3 Writing Action

Definition:

- the primary creation flow for adding a new entry

Purpose:

- keep writing accessible from anywhere important in the product

## 4. Top-Level Product Structure

The MVP should have three top-level areas:

1. `Archive`
2. `Drafts`
3. `New Entry`

### 4.1 Archive

Role:

- the main home of the product
- the default landing area

What lives here:

- all saved entries
- entry previews
- search or filter entry point
- recent writing overview

Why it matters:

- this is where the user sees that their writing is accumulating

### 4.2 Drafts

Role:

- the place where grouped writing becomes a book draft

What lives here:

- all saved drafts
- draft count and status
- access to create a new draft

Why it matters:

- this is where the product differentiates itself from a memo app

### 4.3 New Entry

Role:

- the fastest path to writing

What lives here:

- the writing interface for creating an entry

Why it matters:

- the product fails if writing is not always easy to start

## 5. Hierarchical Structure

Recommended MVP structure:

- Archive
- Entry Detail
- Drafts
- Draft Detail
- Draft Preview
- New Entry

Expanded structure:

- Archive
- list of entries
- search or filter entry point
- entry detail
- edit entry
- add entry to draft
- Drafts
- list of drafts
- create draft
- draft detail
- organize draft entries
- draft preview
- New Entry
- create and save entry

## 6. Primary Navigation Model

Recommended primary navigation:

- `Archive`
- `Drafts`
- `Write`

This keeps the product understandable and focused.

### Navigation intent

- `Archive` supports reflection and rediscovery
- `Drafts` supports structure and progression
- `Write` supports immediate capture

## 7. Core Screen Relationships

The main relationship map should look like this:

1. User opens `Archive`
2. User moves to `New Entry`
3. Saved entry returns to `Archive`
4. User opens `Entry Detail`
5. User selects entries and creates a `Draft`
6. User opens `Draft Detail`
7. User moves to `Draft Preview`

This means the product has one central loop:

`Write -> Save -> Revisit -> Group -> Preview -> Write Again`

## 8. Entry Flow Architecture

Entry-related flow:

- New Entry
- Save Entry
- Archive List
- Entry Detail
- Edit Entry
- Add to Draft

Design implication:

- entries are the foundational unit of the entire product
- all draft behavior depends on entry clarity and usability

## 9. Draft Flow Architecture

Draft-related flow:

- Draft List
- Create Draft
- Select Entries
- Draft Detail
- Reorder Entries
- Draft Preview

Design implication:

- drafts should feel lightweight and approachable
- users should not feel like they are entering a complex editing tool

## 10. Ownership Model

The product should communicate clear ownership:

- entries belong to the user as personal writing assets
- drafts are user-curated groupings of those assets

This is important because the product's value depends on writing feeling retained, not lost in a feed.

## 11. Information Priority

The MVP should prioritize information in this order:

1. writing content
2. writing history
3. draft structure
4. metadata

This means:

- body text matters more than decorative controls
- dates matter because they support memory and retrieval
- draft grouping matters because it creates the book experience
- advanced settings should stay minimal

## 12. Structural Risks To Avoid

### Risk 1. Feed-Like Structure

If Archive behaves too much like SNS, writing will feel temporary instead of owned.

### Risk 2. Editor-Heavy Structure

If Drafts behave too much like publishing software, users will feel intimidated.

### Risk 3. Hidden Draft Value

If draft creation is buried too deeply, users may never discover the product's core value.

## 13. Recommended MVP IA Decision

The Archive should be the home screen.

Reason:

- it is the clearest place to visualize accumulated writing
- it supports both reflection and action
- it naturally connects to both writing and draft creation

The product's default mental model should be:

"This is where my writing lives."

not:

"This is where I manage content."

## 14. Next Design And Engineering Use

This IA should be used as the basis for:

1. wireframes
2. navigation design
3. route structure
4. state structure
5. data model definition
