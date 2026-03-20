# Book Maker Screen List

## 1. Purpose

This document defines the minimum screen structure for the Book Maker MVP.

The goal is to translate the product brief and user journey into a usable interface structure that design and development can act on.

## 2. Screen Principles

Each screen should support at least one of the following outcomes:

- make writing easy
- make accumulation visible
- make old writing easy to revisit
- make book drafting feel achievable

The MVP should avoid unnecessary navigation depth and should keep the main experience simple.

## 3. Core Screen List

### Screen 1. Home / Archive

Purpose:

- act as the default landing screen after entering the app
- show that writing is accumulating over time
- help the user quickly re-enter writing or revisit past entries

Primary user questions answered here:

- What have I written so far?
- How much have I written?
- What should I do next?

Core elements:

- archive header
- quick action to create a new entry
- list of saved entries
- entry preview cards or rows
- date information
- search or filter entry point
- entry point to book drafts

Notes:

- this should feel more like a personal archive than a social feed
- progress and accumulation should be visible without becoming dashboard-heavy

### Screen 2. New Entry

Purpose:

- let the user capture a short piece of writing with minimal friction

Primary user question answered here:

- Can I write this down right now without pressure?

Core elements:

- writing area
- optional title field
- body input
- save action
- automatic date handling

Notes:

- this screen should reduce the pressure of formal writing
- the interface should make a short entry feel complete and valid

### Screen 3. Entry Detail / Edit

Purpose:

- let the user revisit one saved entry in full
- allow small edits without turning the process into a heavy editor

Primary user questions answered here:

- What did I write here?
- Do I want to revise or tag this entry?

Core elements:

- full title
- full body
- created date
- updated date
- edit action
- optional tags or labels
- action to add the entry to a draft

Notes:

- this screen is about ownership and clarity, not advanced formatting

### Screen 4. Draft List

Purpose:

- show all saved book drafts
- make it clear that entries can become something larger

Primary user questions answered here:

- Have I started any books?
- Which draft should I continue?

Core elements:

- list of book drafts
- draft title
- number of included entries
- last updated date
- action to create a new draft

Notes:

- even one unfinished draft should feel encouraging, not incomplete

### Screen 5. Create Draft

Purpose:

- allow the user to select entries and group them into a book draft

Primary user questions answered here:

- Which entries belong together?
- Can these pieces become a book?

Core elements:

- draft title input
- optional draft description
- selectable entry list
- selection summary
- create draft action

Notes:

- selection should be simple and understandable
- this is the transition point from archive behavior to book behavior

### Screen 6. Draft Detail / Organize

Purpose:

- let the user manage one draft as a structured collection of entries

Primary user questions answered here:

- What is the order of this draft?
- Does this group of entries feel coherent?

Core elements:

- draft title
- optional description
- ordered list of selected entries
- reorder interaction
- remove entry action
- add more entries action
- preview action

Notes:

- this is the lightest possible version of an editor
- complexity should stay low

### Screen 7. Draft Preview

Purpose:

- present the selected entries as a continuous reading experience

Primary user question answered here:

- Does this feel like the beginning of a book?

Core elements:

- book title
- optional introductory text
- entries rendered as a reading flow
- clear section breaks between entries
- back action to edit the draft

Notes:

- this screen is critical to product value
- it must feel closer to reading a manuscript than browsing a list

## 4. Suggested Navigation Model

The MVP navigation can remain simple:

- Home / Archive
- Drafts
- New Entry

Recommended secondary paths:

- from archive entry to entry detail
- from entry detail to add-to-draft
- from drafts to draft detail
- from draft detail to preview

## 5. Priority By Build Order

Recommended implementation order:

1. Home / Archive
2. New Entry
3. Entry Detail / Edit
4. Draft List
5. Create Draft
6. Draft Detail / Organize
7. Draft Preview

This order supports early validation of writing and archive behavior before draft-building is fully refined.

## 6. Open Questions

These questions should be resolved in design and scope planning:

1. Should entry creation happen in a dedicated page, modal, or bottom sheet?
2. Should tags be included in the first MVP or postponed?
3. Should draft creation begin from the archive selection flow or from a dedicated draft creation screen?
4. How book-like should the preview be in the first version?

## 7. Next Documents

The next PM documents should be:

1. `MVP_SCOPE.md`
2. `SUCCESS_METRICS.md`
