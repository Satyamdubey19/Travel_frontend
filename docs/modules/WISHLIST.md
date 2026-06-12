# Wishlist Frontend Module

## Purpose

Wishlist lets authenticated users save hotels, tours, rentals, and activities and view them on the wishlist page.

## Source Files

```text
contexts/WishlistContext.tsx
app/wishlist/page.tsx
components/home/TravelListingCard.tsx
components/tour/TourCard.tsx
lib/axios.ts
```

## Supported Targets

```text
HOTEL
TOUR
RENTAL
ACTIVITY
```

## Flow

```text
Listing card renders
  -> user toggles wishlist
  -> context updates local UI
  -> POST or DELETE /api/wishlist
  -> wishlist page reads saved items
```

## Backend API

```text
GET /api/wishlist
POST /api/wishlist
DELETE /api/wishlist
```

## Testing Notes

```text
Unauthenticated toggle should prompt login or fail gracefully.
Authenticated toggle should update UI.
Duplicate add should not create duplicate cards.
Remove should update listing card and wishlist page.
Backend error should rollback or display message.
```
