# Book Maker Frontend App Structure

## 1. Purpose

This document defines the frontend structure for the Book Maker MVP using `Nuxt 3 + Vue 3`.

The frontend must support two distinct but connected experiences:

- a public landing experience
- a private writing application

The structure should keep these two experiences clearly separated while allowing them to live in one product.

## 2. Frontend Principle

Book Maker is not only an app and not only a marketing site.

The frontend should be structured so that:

- the landing page tells the product story
- the app supports focused writing and drafting
- the user always understands whether they are in public or private mode

## 3. Top-Level Route Strategy

Recommended route structure:

- `/`
- public landing page
- `/login`
- authentication entry
- `/signup`
- account creation
- `/app`
- authenticated app root
- `/app/archive`
- archive home
- `/app/entries/new`
- create entry
- `/app/entries/[id]`
- entry detail/edit
- `/app/drafts`
- draft list
- `/app/drafts/new`
- create draft
- `/app/drafts/[id]`
- draft detail/organize
- `/app/drafts/[id]/preview`
- draft preview

## 4. Layout Strategy

Recommended Nuxt layouts:

- `default`
- for landing and public pages
- `app`
- for authenticated writing experience
- `auth`
- for login and signup pages

### default layout

Responsibilities:

- public navigation
- landing page structure
- marketing/footer sections

### app layout

Responsibilities:

- authenticated navigation
- archive/draft/write shell
- mobile-friendly app frame

### auth layout

Responsibilities:

- focused authentication screens with minimal distraction

## 5. Suggested Folder Direction

Conceptual frontend structure:

```text
app/
components/
composables/
layouts/
middleware/
pages/
plugins/
types/
utils/
```

Suggested expansion:

```text
components/
  landing/
  archive/
  entry/
  draft/
  common/

composables/
  useAuth.ts
  useEntries.ts
  useDrafts.ts
  useAutosave.ts

pages/
  index.vue
  login.vue
  signup.vue
  app/
    index.vue
    archive.vue
    entries/
      new.vue
      [id].vue
    drafts/
      index.vue
      new.vue
      [id].vue
      [id]/
        preview.vue
```

## 6. Navigation Model

The authenticated app should be organized around three primary actions:

- `Archive`
- `Drafts`
- `Write`

This aligns with the product's IA:

`Write -> Archive -> Draft -> Preview`

### Navigation intent

- `Archive` is the user's writing home
- `Drafts` is where writing becomes a manuscript
- `Write` is the fastest action in the product

## 7. Public Vs Private Separation

The frontend should clearly distinguish:

- public product surfaces
- private writing surfaces

### Public area

Includes:

- landing page
- product explanation
- calls to action
- eventual public reading pages in future phases

### Private area

Includes:

- archive
- entry editing
- draft creation
- draft organization
- draft preview

This separation matters because the emotional tone is different:

- public pages invite
- private pages protect focus

## 8. Page Responsibilities

### Landing Page

Purpose:

- communicate the product story
- explain why short writing should become a book
- drive signup or product entry

### Archive Page

Purpose:

- show accumulated writing
- allow revisit and rediscovery
- provide access to write again or begin draft creation

### Entry Editor Page

Purpose:

- support low-friction writing
- support autosave
- keep the user focused on content rather than settings

### Draft List Page

Purpose:

- show all draft containers
- encourage progression from archive to book thinking

### Draft Detail Page

Purpose:

- organize selected entries
- manage sequence and draft identity

### Draft Preview Page

Purpose:

- make the writing feel like a book beginning
- give emotional reward and motivation to continue

## 9. State Responsibility

The frontend state should be kept simple and domain-focused.

### Auth state

Responsibilities:

- current user
- auth bootstrap
- login state
- token refresh handling

### Entry state

Responsibilities:

- entry list
- current entry
- create/update/delete flows
- autosave status

### Draft state

Responsibilities:

- draft list
- current draft
- draft entry ordering
- preview data

## 10. Data Fetching Direction

Recommended approach:

- server-render where useful for public landing pages
- app data loaded via authenticated API requests
- keep private app interactions highly responsive on the client

This means:

- landing pages benefit from Nuxt SSR/SEO
- writing flows behave like a modern SPA experience

## 11. Middleware Direction

Recommended middleware:

- auth-required middleware for `/app/**`
- guest-only middleware for `/login` and `/signup` if appropriate

Responsibilities:

- redirect unauthenticated users away from private routes
- prevent confusing access patterns

## 12. Autosave Frontend Behavior

The frontend must handle autosave carefully.

Suggested behavior:

1. local state updates immediately on typing
2. debounced API update is triggered
3. UI shows save state such as:
- saving
- saved
- failed

This is essential because writing trust depends on clear save feedback.

## 13. UI Structure Priorities

The frontend should prioritize:

1. writing clarity
2. archive readability
3. draft organization simplicity
4. preview immersion
5. landing page storytelling

The product should not feel like an admin dashboard or note-taking utility.

## 14. Future Route Expansion

The route design should leave room for:

- `/books/[slug]`
- public reading pages
- `/app/books`
- published book management
- `/app/settings`
- account and preferences
- `/app/review`
- future proofreading or plagiarism tools

These routes should not be implemented yet, but the structure should not block them.

## 15. Suggested Build Order

1. app layout
2. auth pages
3. archive page
4. entry create/edit page
5. draft list page
6. draft detail page
7. draft preview page
8. landing page polish

## 16. Next Documents

The next implementation planning documents should be:

1. `IMPLEMENTATION_PHASES.md`
2. `DESIGN_PRINCIPLES.md`
3. `API_RESPONSE_CONVENTIONS.md`
