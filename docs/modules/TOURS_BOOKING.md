# Tours And Booking Frontend Module

## Purpose

This module covers tour listing, tour detail, the tour booking wizard, traveler forms, payment initiation, tour chat surfaces, and host participant views.

## Source Files

```text
app/tours/page.tsx
app/tours/[slug]/page.tsx
app/tours/[slug]/chat/page.tsx
components/tour/*
hooks/useTourBooking.ts
store/tourBookingWizardSlice.ts
validators/tour-booking.validators.ts
lib/tours.ts
lib/traveler-normalization.ts
lib/traveler-identity.ts
types/tour-booking.ts
```

## Public Tour Listing Flow

```text
/tours
  -> fetch tour list
  -> render TourCard rows/cards
  -> apply filters/search where implemented
  -> user opens /tours/[slug]
```

## Tour Detail Flow

```text
/tours/[slug]
  -> load tour detail
  -> show gallery, itinerary, highlights, pricing, availability
  -> user starts booking
  -> TourBookingWizard opens
```

## Booking Wizard Flow

```text
select departure/date
  -> choose traveler count
  -> enter contact details
  -> add traveler identity details
  -> client duplicate pre-validation where possible
  -> POST /api/tour/[id]/booking-intents
  -> backend returns booking status and amount
  -> payment order if required
  -> payment verification
  -> confirmation, waitlist, or error UI
```

Backend endpoints:

```text
POST /api/tour/[id]/booking-intents
POST /api/tour/[id]/payment/order
POST /api/tour/[id]/payment/verify
POST /api/tour-bookings/[bookingId]/travelers
POST /api/tour-bookings/[bookingId]/cancel
POST /api/tour/[id]/validate-traveler
```

## Traveler Forms

Traveler forms collect:

```text
full name
relation
email and phone
age/date of birth
gender
emergency contact
food preference
medical notes
blood group
ID type/document URL where supported
```

Frontend duplicate checks are only pre-validation. Backend remains the source of truth.

## Payment Flow

```text
booking intent returns bookingId/amount
  -> request Razorpay order
  -> open Razorpay checkout using NEXT_PUBLIC_RAZORPAY_KEY_ID
  -> send payment id/order id/signature to backend
  -> backend verifies signature
  -> UI shows confirmed booking
```

## Chat Flow

```text
/tours/[slug]/chat
/host/tours/[id]/chat
  -> load messages
  -> connect socket where configured
  -> send messages
  -> update UI with persisted/broadcast messages
```

## Testing Notes

```text
Tour list renders loading/empty/error states.
Tour detail handles unknown slug.
Booking requires login before protected submission.
Traveler validation errors show near fields.
Duplicate travelers are blocked by backend response.
Payment order errors do not confirm booking.
Payment verification failure shows failure state.
Waitlisted booking shows waitlist status.
Chat requires authenticated user and handles socket unavailable state.
```
