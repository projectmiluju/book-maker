# Book Maker Auth Flow

## 1. Purpose

This document defines the authentication flow for the Book Maker MVP.

The auth design must support:

- secure private writing data
- a smooth web app experience
- token refresh without forcing repeated login
- later expansion to public/private content boundaries

## 2. Auth Principle

Book Maker starts as a private-first writing product.

That means:

- entries are private by default
- drafts are private by default
- all writing APIs require authentication
- public reading features come later as a separate capability

## 3. Chosen Auth Strategy

Recommended MVP strategy:

- access token for authenticated API requests
- refresh token for session continuation
- Redis-backed refresh token/session control

## 4. Why This Strategy

This approach is used because the product needs:

- secure API access
- session continuity for frequent writing use
- explicit token invalidation support
- separation between durable user data and short-lived auth state

## 5. Auth Lifecycle

### 5.1 Sign Up

Flow:

1. user submits email and password
2. backend validates input
3. backend creates user
4. backend issues access token
5. backend issues refresh token
6. refresh token state is stored or tracked through Redis
7. frontend stores session state

### 5.2 Login

Flow:

1. user submits credentials
2. backend verifies identity
3. backend issues access token
4. backend issues refresh token
5. Redis stores refresh token session context
6. frontend enters authenticated app state

### 5.3 Authenticated Request

Flow:

1. frontend sends access token with API request
2. backend validates access token
3. request proceeds if valid
4. request fails with unauthorized response if invalid or expired

### 5.4 Token Refresh

Flow:

1. access token expires
2. frontend calls refresh endpoint
3. backend validates refresh token
4. backend checks Redis-backed token/session state
5. backend issues new access token
6. backend may rotate refresh token
7. frontend retries protected requests if refresh succeeds

### 5.5 Logout

Flow:

1. frontend calls logout endpoint
2. backend invalidates refresh token session in Redis
3. frontend clears local auth state
4. protected API access ends

## 6. Recommended Token Handling

### Access Token

Purpose:

- short-lived authorization for API requests

Characteristics:

- contains user identity claims
- expires relatively quickly

### Refresh Token

Purpose:

- renew access without forcing frequent login

Characteristics:

- longer-lived than access token
- validated against Redis-backed state
- revocable on logout or session reset

## 7. Storage Strategy

The exact frontend storage method should be finalized during implementation, but the preferred security direction is:

- keep access token handling minimal and controlled
- keep refresh token handling secure and revocable

Practical implementation choices may include:

- secure cookie-based refresh token handling
- frontend-managed access token state

## 8. Redis Role

Redis is used for:

- refresh token/session tracking
- revocation support
- optional rotation metadata
- short-lived auth state if needed

Redis is not the source of truth for user identity.

PostgreSQL remains the source of truth for users.

## 9. Authorization Rules

### Private Resources

The following must always be user-scoped:

- entries
- drafts

Rules:

- user can only access their own entries
- user can only access their own drafts
- draft-entry relationships must also be ownership-safe

### Future Public Resources

Later, some `Book` resources may become public.

At that point:

- `Entry` remains private unless intentionally exposed through a public book
- `Draft` remains private editing space
- `Book` may be readable publicly depending on visibility setting

## 10. Error Handling

Recommended auth error categories:

- invalid credentials
- unauthorized
- forbidden
- expired token
- invalid refresh token
- revoked session

The frontend should be able to distinguish:

- when to retry through refresh
- when to redirect to login

## 11. Security Priorities

- password hashing must be strong
- refresh tokens must be revocable
- token validation must be strict
- private resource access must always be ownership-checked
- auth errors must not leak sensitive data

## 12. MVP Scope For Auth

Must include:

- signup
- login
- refresh
- logout
- current-user bootstrap endpoint

Deferred:

- social login
- multi-factor auth
- device session management UI
- password reset flow if MVP speed must be protected

## 13. Suggested Backend Components

- JWT token service
- password hashing service
- refresh token/session repository backed by Redis
- auth guard for protected routes
- current-user decorator or equivalent user context helper

## 14. Frontend Implications

The frontend app should support:

- bootstrap session check on app load
- redirect to auth screen if unauthenticated
- silent refresh attempt when access token expires
- clear autosave interruption handling if auth expires mid-writing

## 15. Future Expansion

This auth flow should later support:

- public/private visibility boundaries
- published book viewing without login
- collaboration permissions
- invite-based feedback

## 16. Next Documents

The next implementation planning documents should be:

1. `DB_SCHEMA_PLAN.md`
2. `FRONTEND_APP_STRUCTURE.md`
