# Book Maker DB Schema Plan

## 1. Purpose

This document defines the PostgreSQL schema direction for the Book Maker MVP.

The schema should:

- support the confirmed MVP cleanly
- stay simple enough for fast implementation
- preserve room for future expansion into books, attachments, and publication workflows

## 2. Database Role

PostgreSQL is the primary source of truth for durable business data.

It is responsible for:

- users
- entries
- drafts
- draft-entry ordering
- core timestamps and ownership

Redis is intentionally excluded from this schema plan because it serves short-lived auth and cache responsibilities.

## 3. MVP Tables

The initial schema should include:

- `users`
- `entries`
- `drafts`
- `draft_entries`

Optional operational table depending on auth implementation:

- `user_sessions` or equivalent persistent session audit table

## 4. users

### Purpose

- stores account identity

### Suggested columns

- `id` UUID primary key
- `email` varchar unique not null
- `password_hash` varchar not null
- `display_name` varchar not null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Notes

- email uniqueness is required
- password hashes must never be reversible

## 5. entries

### Purpose

- stores the user's core writing units

### Suggested columns

- `id` UUID primary key
- `user_id` UUID not null references `users(id)`
- `title` varchar null
- `body` text not null default ''
- `status` varchar not null default 'draft'
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()
- `last_saved_at` timestamptz not null default now()

### Notes

- `title` stays optional because fast writing should not require formal structure
- `status` supports future archive handling and incomplete-writing views

### Suggested status values

- `draft`
- `completed`
- `archived`

## 6. drafts

### Purpose

- stores book draft containers

### Suggested columns

- `id` UUID primary key
- `user_id` UUID not null references `users(id)`
- `title` varchar not null
- `description` text null
- `status` varchar not null default 'active'
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Suggested status values

- `active`
- `archived`

## 7. draft_entries

### Purpose

- stores ordered entry membership inside drafts

### Suggested columns

- `id` UUID primary key
- `draft_id` UUID not null references `drafts(id)` on delete cascade
- `entry_id` UUID not null references `entries(id)` on delete cascade
- `position` integer not null
- `created_at` timestamptz not null default now()

### Constraints

- unique (`draft_id`, `entry_id`)
- unique (`draft_id`, `position`)

### Notes

- `position` is required because order is a core manuscript concept

## 8. Recommended Indexes

### users

- unique index on `email`

### entries

- index on `user_id`
- composite index on (`user_id`, `created_at` desc)
- composite index on (`user_id`, `updated_at` desc)
- optional index on (`user_id`, `status`)

### drafts

- index on `user_id`
- composite index on (`user_id`, `updated_at` desc)

### draft_entries

- index on `draft_id`
- index on `entry_id`
- unique index on (`draft_id`, `entry_id`)
- unique index on (`draft_id`, `position`)

## 9. Relationship Rules

### Ownership

- every `entry` must belong to one `user`
- every `draft` must belong to one `user`
- every `draft_entry` must connect a draft to an entry owned by the same user

### Integrity

Application-level validation must ensure:

- a user cannot attach another user's entry into their draft
- reorder requests preserve valid positions
- deleting a draft removes related `draft_entries`

## 10. Timestamp Rules

Recommended behavior:

- `created_at` is immutable
- `updated_at` changes on every meaningful update
- `last_saved_at` updates specifically for writing/autosave behavior

This distinction is useful because:

- `updated_at` reflects general modification
- `last_saved_at` can power explicit save feedback in the UI

## 11. Search Direction

MVP search can begin simply with:

- title filtering
- body substring matching

Possible first implementation:

- `ILIKE`-based search scoped by user

Future enhancement:

- PostgreSQL full-text search

This means a separate search engine is not needed for the MVP.

## 12. Soft Delete Decision

Initial recommendation:

- do not add soft delete columns in the first schema unless recovery is part of the first implementation cycle

Why:

- it adds complexity to nearly every query
- the current MVP does not yet include trash/restore UX

If later required:

- add `deleted_at`
- add trash-specific flows

## 13. Future Tables

These should not be implemented in the first schema unless development scope expands.

### Future content tables

- `books`
- `book_chapters`
- `attachments`
- `publications`
- `entry_versions`

### Future operational tables

- `user_feedback_invites`
- `reader_comments`
- `public_book_views`

## 14. Example MVP SQL Shape

This is conceptual only, not the final migration.

```sql
create table users (
  id uuid primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  display_name varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table entries (
  id uuid primary key,
  user_id uuid not null references users(id),
  title varchar(255),
  body text not null default '',
  status varchar(32) not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_saved_at timestamptz not null default now()
);

create table drafts (
  id uuid primary key,
  user_id uuid not null references users(id),
  title varchar(255) not null,
  description text,
  status varchar(32) not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table draft_entries (
  id uuid primary key,
  draft_id uuid not null references drafts(id) on delete cascade,
  entry_id uuid not null references entries(id) on delete cascade,
  position integer not null,
  created_at timestamptz not null default now(),
  unique (draft_id, entry_id),
  unique (draft_id, position)
);
```

## 15. Schema Principles

- keep the first schema relational and explicit
- optimize for ownership and ordering correctness
- avoid premature tables for future features
- expand only when a roadmap phase requires it

## 16. Next Documents

The next implementation planning documents should be:

1. `FRONTEND_APP_STRUCTURE.md`
2. `API_RESPONSE_CONVENTIONS.md`
3. `IMPLEMENTATION_PHASES.md`
