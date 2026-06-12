# Listings And Content Frontend Module

## Purpose

This module covers activities, rentals, posts, and public content/listing pages outside the main tours flow.

## Source Files

```text
app/activities/page.tsx
app/activities/[slug]/page.tsx
app/posts/page.tsx
components/home/*
components/sections/*
lib/activities.ts
lib/rentals.ts
lib/userPosts.ts
types/page-types.ts
```

## Activities Flow

```text
/activities
  -> list activities
  -> render activity cards
  -> user opens /activities/[slug]
  -> detail page renders activity data
```

Backend APIs:

```text
GET /api/activity
GET /api/activity/[id]
```

## Rentals Flow

Rental data appears through home/listing/admin/host surfaces where implemented.

Backend APIs:

```text
GET /api/rental
GET /api/rental/[id]
```

## Posts Flow

```text
/posts
  -> load local userPosts data
  -> manage local likes in localStorage
  -> render travel/social post UI
```

## Testing Notes

```text
Activity list handles backend unavailable state.
Activity detail handles unknown slug.
Rental card/list data maps backend fields safely.
Posts local likes survive refresh.
Public content should not require auth unless explicitly designed.
```
