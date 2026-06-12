# Profile And Bookings Frontend Module

## Purpose

This module covers the user profile page, local profile state, profile updates, preferences, privacy settings, and booking history.

## Source Files

```text
app/profile/page.tsx
app/my-bookings/page.tsx
contexts/AuthContext.tsx
types/my-bookings.ts
types/auth.ts
lib/axios.ts
components/ui/*
```

## Profile Flow

```text
/profile
  -> wait for auth hydration
  -> read backend user from AuthContext
  -> merge with local profile storage where used
  -> render profile sections
  -> user edits profile
  -> PATCH /api/auth/me
  -> update local UI state
```

Backend endpoint:

```text
PATCH /api/auth/me
```

## Local Profile Storage

The profile page uses browser storage for some profile UI state.

```text
storage key: userProfile:<userId>
legacy key: userProfile
```

Security note:

```text
Do not store secrets or auth tokens in profile localStorage.
Backend remains source of truth for identity, role, email, and phone.
```

## My Bookings Flow

```text
/my-bookings
  -> require authenticated user
  -> GET /api/my-bookings
  -> group/render bookings by status
  -> allow detail/cancellation where supported
```

## Testing Notes

```text
Unauthenticated profile should prompt login.
Profile edit should handle validation errors from backend.
Auth user changes should update profile display.
Local stale profile should not override backend identity fields.
Bookings page should show loading, empty, error, and populated states.
User should not see another user's bookings.
```
