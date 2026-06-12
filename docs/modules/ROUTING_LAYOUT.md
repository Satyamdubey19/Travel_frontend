# Routing And Layout Module

## Purpose

This module covers application routing, root layout, providers, navigation, header, footer, and route-level boundaries.

## Source Files

```text
app/layout.tsx
app/providers.tsx
app/error.tsx
app/not-found.tsx
middleware.ts
components/layout/Header/*
components/layout/Footer/*
types/layout.ts
```

## App Boot Flow

```text
app/layout.tsx
  -> root HTML shell
  -> app/providers.tsx
  -> Redux Provider
  -> TanStack Query Provider
  -> AuthProvider / WishlistProvider where wired
  -> Sonner/toast provider
  -> route content
```

## Page Groups

```text
Public:
  /
  /login
  /signup
  /forgot-password
  /terms
  /posts
  /activities
  /activities/[slug]
  /tours
  /tours/[slug]

Authenticated:
  /profile
  /my-bookings
  /wishlist

Host:
  /host
  /host/signup
  /host/kyc
  /host/tours
  /host/tours/[id]
  /host/tours/[id]/chat
  /host/tours/[id]/participants
  /host/bookings
  /host/bookings/[bookingId]
  /host/payments
  /host/reviews
  /host/analytics

Admin:
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

## Navigation

Header uses auth state to determine:

```text
signed-in user menu
host/admin links
profile menu
logout behavior
```

Footer contains shared site navigation and subscription UI.

## Testing Notes

```text
Unauthenticated user should see login/signup actions.
Authenticated USER should see profile/bookings/wishlist.
HOST should see host workspace links only when backend auth state grants host access.
ADMIN should see admin links.
Logout should clear menus and route state.
not-found and error boundaries should render cleanly.
```
