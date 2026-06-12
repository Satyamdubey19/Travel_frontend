# Admin Frontend Module

## Purpose

The admin module provides moderation and operational screens for users, hosts, KYC, listings, bookings, payouts, posts, and analytics.

## Source Files

```text
app/admin/*
types/admin.ts
utils/admin-query.ts
lib/axios.ts
components/ui/*
```

## Pages

```text
/admin
/admin/analytics
/admin/bookings
/admin/hosts
/admin/kyc
/admin/payouts
/admin/posts
/admin/rentals
/admin/tours
/admin/users
```

## Backend APIs

```text
GET /api/admin/dashboard
GET /api/admin/users
PATCH /api/admin/users/[id]
GET /api/admin/hosts
PATCH /api/admin/hosts/[id]
GET /api/admin/kyc
PATCH /api/admin/kyc/[id]
GET /api/admin/listings
PATCH /api/admin/listings/[type]/[id]
GET /api/admin/bookings
PATCH /api/admin/bookings/[id]
GET /api/admin/payouts
PATCH /api/admin/payouts/[id]
GET/PATCH /api/admin/posts
```

## Auth

Admin pages require backend role `ADMIN`.

```text
AuthProvider / route checks
  -> user.role ADMIN
  -> admin API calls still enforce server-side requireAdmin
```

Frontend checks are UX only. Backend remains the security boundary.

## Common Admin Flow

```text
page loads
  -> call relevant /api/admin endpoint
  -> render table/cards/stat state
  -> admin filters/searches
  -> admin performs moderation action
  -> PATCH endpoint updates status
  -> UI refreshes list/detail state
```

## Testing Notes

```text
Unauthenticated user cannot access admin pages.
USER/HOST cannot access admin pages.
ADMIN can load each page.
401/403 API responses show clear permission state.
Moderation actions update row status without stale UI.
Filters and pagination preserve query state where implemented.
```
