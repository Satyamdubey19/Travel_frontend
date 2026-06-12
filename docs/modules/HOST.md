# Host Frontend Module

## Purpose

The host module provides host onboarding, dashboard, KYC, listings, participants, bookings, payments, reviews, and analytics screens.

## Source Files

```text
app/host/*
components/host/HostUI.tsx
components/auth/HostSignupForm.tsx
types/host-forms.ts
types/host-pages.ts
types/host-ui.ts
lib/axios.ts
```

## Important Auth Rule

Backend security now treats host signup as an intent:

```text
Public host signup creates USER + pending Host profile.
PATCH /api/auth/me activateHost creates/updates pending Host profile.
Neither path grants HOST role by itself.
```

Frontend must only open the host workspace when backend auth state says the user has host access.

## Pages

```text
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
```

## Host Signup / Onboarding Flow

```text
new user host signup
  -> HostSignupForm
  -> POST /api/auth/register role=host
  -> backend creates USER + pending Host profile
  -> user verifies email and logs in
  -> frontend should show pending/next steps until HOST role is granted

logged-in user host intent
  -> PATCH /api/auth/me activateHost=true
  -> backend creates/updates pending Host profile
  -> frontend should not force role HOST locally
```

## KYC Flow

```text
/host/kyc
  -> collect identity/business fields
  -> upload required documents
  -> submit to backend/admin review flow
  -> admin reviews from /admin/kyc
```

## Tour Management Flow

```text
/host/tours
  -> list host-owned tours
  -> create/edit tour
  -> submit listing for review
  -> backend/admin moderation controls final status
```

## Participant And Booking Flow

```text
/host/tours/[id]/participants
/host/bookings
/host/bookings/[bookingId]
  -> load host-owned operational data
  -> manage traveler/participant status where supported
```

## Testing Notes

```text
USER with pending Host profile should not access host workspace.
HOST user should access host pages.
Unauthenticated user should be redirected to login/signup.
Host pages should handle 401/403 from backend.
KYC upload failures should be visible.
Host must not see another host's tours/bookings.
```
