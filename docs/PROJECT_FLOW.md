# Frontend Project Flow

This document describes how the Travels frontend is structured, how data moves through the app, and how the user-facing workflows connect to the backend.

## Runtime Overview

The frontend is a Next.js App Router application. It runs independently from the backend and proxies API calls through `/api/*`.

```text
Browser
  -> Next.js frontend on http://localhost:3000
  -> axios baseURL /api
  -> Next.js rewrite
  -> backend API on http://localhost:4000/api
```

The backend target is configured in `next.config.ts`.

```text
BACKEND_API_URL=http://localhost:4000
```

If `BACKEND_API_URL` is not set, the frontend uses `http://localhost:4000`.

## Main Technologies

- Next.js App Router for pages, layouts, routing, error boundaries, and static assets.
- React 19 for UI composition.
- TypeScript for typed components, payloads, and route data.
- Tailwind CSS for styling.
- Redux Toolkit for cross-page UI state.
- TanStack Query for server-state caching and mutation handling.
- Axios for API calls.
- NextAuth integration support through `next-auth/react`.
- Sonner for toast notifications.
- Lucide React for icons.

## Directory Roles

```text
app/          Route pages, layouts, global CSS, route boundaries
components/   Reusable UI, page sections, auth forms, booking widgets
contexts/     Auth and wishlist context providers
docs/auth/    Frontend auth flow documentation
docs/modules/ Frontend module-level documentation
hooks/        Reusable React hooks
lib/          API clients, utilities, data helpers, integration helpers
public/       Static images and assets
store/        Redux store and slices
types/        Shared TypeScript types
utils/        Request/response and query helpers
validators/  Client-side validation schemas
```

## Application Boot Flow

1. `app/layout.tsx` renders the root HTML shell.
2. `app/providers.tsx` wraps the app with Redux, TanStack Query, and Sonner.
3. Feature providers such as auth and wishlist provide browser-persisted user state.
4. Pages under `app/` render route-specific screens.
5. Components call the shared axios instance in `lib/axios.ts`.
6. Axios sends requests to `/api/*`.
7. Next.js rewrites `/api/*` to the backend API host.
8. UI state updates through React state, context, Redux slices, or TanStack Query cache.

## API Client Flow

The shared client is defined in `lib/axios.ts`.

```text
Component or hook
  -> api.get/post/patch/delete(...)
  -> baseURL "/api"
  -> frontend rewrite
  -> backend route
  -> response or error
  -> component state, context state, query cache, or toast
```

The helper `getApiErrorMessage()` standardizes backend error payload handling.

Expected backend error shapes:

```text
{ "error": "message" }
{ "message": "message" }
```

## Documentation Map

Auth docs:

```text
docs/auth/README.md
docs/auth/AUTH_FLOW.md
```

Module docs:

```text
docs/modules/API_CLIENT.md
docs/modules/ROUTING_LAYOUT.md
docs/modules/HOME_SEARCH.md
docs/modules/TOURS_BOOKING.md
docs/modules/HOST.md
docs/modules/ADMIN.md
docs/modules/WISHLIST.md
docs/modules/PROFILE_BOOKINGS.md
docs/modules/LISTINGS_CONTENT.md
docs/modules/UI_STATE.md
```

## Frontend Page Map

### Public Pages

```text
/                         Home page
/login                    Login page
/signup                   User signup
/forgot-password          Password recovery request
/terms                    Terms page
/posts                    Travel posts page
/activities               Activity listing
/activities/[slug]        Activity detail
/tours                    Tour listing
/tours/[slug]             Tour detail
/tours/[slug]/chat        Tour chat
```

### Authenticated User Pages

```text
/profile                  User profile
/my-bookings              User booking history
/wishlist                 Saved hotels, tours, rentals, and activities
```

### Host Pages

```text
/host                     Host dashboard
/host/signup              Host onboarding
/host/kyc                 Host KYC flow
/host/tours               Host tour management
/host/tours/[id]          Host tour detail/edit area
/host/tours/[id]/chat     Host-side tour chat
/host/tours/[id]/participants  Participant management
/host/bookings            Host bookings list
/host/bookings/[bookingId] Host booking detail
/host/payments            Host payments
/host/reviews             Host reviews
/host/analytics           Host analytics
```

### Admin Pages

```text
/admin                    Admin dashboard
/admin/analytics          Platform analytics
/admin/bookings           Booking moderation and tracking
/admin/hosts              Host moderation
/admin/kyc                KYC review queue
/admin/payouts            Payout review
/admin/posts              Content moderation
/admin/rentals            Rental moderation
/admin/tours              Tour moderation
/admin/users              User moderation
```

## Auth Flow

Auth is coordinated by `contexts/AuthContext.tsx`.

### Session Hydration

1. On app load, the context reads `localStorage.user`.
2. It hydrates a temporary user immediately if local data exists.
3. It calls `GET /api/auth/me`.
4. If the backend returns a valid user, backend state replaces local state.
5. If the backend is unavailable and a local session exists, the local session remains.
6. If no session exists, user state is `null`.

### Login

```text
LoginForm
  -> AuthContext.login(email, password, expectedRole?)
  -> POST /api/auth/login
  -> backend validates credentials
  -> returns user payload
  -> frontend stores sanitized user in localStorage
```

If the API is unavailable, the context can fall back to browser-stored demo/local accounts. This is only a development convenience and should not be treated as production authentication.

### Signup

```text
SignupForm or HostSignupForm
  -> AuthContext.signup(...)
  -> POST /api/auth/register
  -> backend creates account and sends verification email
  -> registration does not create a login cookie
  -> user verifies email and then logs in
```

### Become Host

```text
Logged-in user
  -> becomeHost({ businessName, phone })
  -> PATCH /api/auth/me
  -> backend creates or updates pending Host profile
  -> frontend should not treat user as HOST until backend returns HOST access
```

### Logout

```text
logout()
  -> clears local session
  -> POST /api/auth/logout
  -> signOut({ redirect: false })
```

## Global State Flow

Redux is initialized in `store/store.ts`.

```text
modal              Shared modal state
notifications      In-app notification state
socket             Socket connection metadata
tourBookingWizard  Multi-step tour booking state
```

Use Redux for state that must survive route changes or be shared across unrelated components. Use local component state for form-only or view-only state.

TanStack Query is configured in `app/providers.tsx`.

```text
staleTime: 30 seconds
refetchOnWindowFocus: false
query retry: 1
mutation retry: 0
```

Use TanStack Query for fetched data and mutations when data has a server source of truth.

## Home Page Flow

```text
/ app/page.tsx
  -> HomePage
  -> sections:
       HeroSection
       PopularDestinations
       TourPackages
       HomeFeaturedTours
       PopularTourPackages
       LocationStories
       BlogSection
       TestimonialsSection
       NewsletterSection
```

The home page combines static marketing data from `lib/homeData.ts` with dynamic listing components where available.

## Search And Location Flow

Search UI lives under `components/search`.

```text
SearchBar
  -> LocationInput
  -> DatePicker
  -> LocationDetector
```

`LocationDetector` works like this:

1. Read cached `userLocation` from `localStorage`.
2. If cache is fresh, display it.
3. Try browser GPS with `navigator.geolocation`.
4. Call `GET /api/location/gps?lat=...&lng=...`.
5. If GPS fails, call `GET /api/location/ip`.
6. Store the detected city and source in `localStorage`.
7. Fall back to `India` if both methods fail.

Important dependency:

```text
Frontend /api/location/*
  -> backend http://localhost:4000/api/location/*
```

The backend must be running for location detection to work.

## Tour Listing Flow

```text
/tours
  -> fetch tour list from backend
  -> render TourCard rows/cards
  -> user filters/searches
  -> user opens /tours/[slug]
```

Tour cards display key data such as title, destination, price, capacity, images, and availability.

## Tour Detail And Booking Flow

```text
/tours/[slug]
  -> load tour detail
  -> show images, itinerary, highlights, included/excluded items
  -> user starts booking
  -> TourBookingWizard opens
```

The booking wizard state is held in `store/tourBookingWizardSlice.ts`.

Typical booking steps:

1. Select date/departure batch if available.
2. Choose traveler count.
3. Enter contact details.
4. Add traveler identity details.
5. Validate duplicate traveler identities client-side where possible.
6. Submit booking intent to backend.
7. Backend returns booking status and amount.
8. If payment is required, start Razorpay order flow.
9. Verify payment with backend.
10. Show confirmation, waitlist, or error state.

Expected backend endpoints in this flow:

```text
POST /api/tour/[id]/booking-intents
POST /api/tour/[id]/payment/order
POST /api/tour/[id]/payment/verify
POST /api/tour-bookings/[bookingId]/travelers
POST /api/tour-bookings/[bookingId]/cancel
```

## Traveler Details Flow

Traveler forms are handled through:

```text
components/tour/TravelerFormCard.tsx
components/tour/TourBookingWizard.tsx
validators/tour-booking.validators.ts
lib/traveler-normalization.ts
lib/traveler-identity.ts
```

The frontend collects traveler details such as:

- Full name
- Age or date of birth
- Email and phone
- Gender
- Emergency contact
- Country
- Food preference
- Medical notes
- Blood group
- ID type and optional uploaded document URL

The backend performs final duplicate checks and booking persistence.

## Tour Chat Flow

```text
/tours/[slug]/chat
/host/tours/[id]/chat
```

These pages represent traveler and host chat surfaces for a tour. The backend contains `TourChatRoom`, `TourMessage`, and socket gateway structures for real-time messaging.

Expected behavior:

1. User opens chat page.
2. Frontend loads existing messages from backend.
3. Frontend connects to socket layer when enabled.
4. Messages are sent to backend.
5. Backend persists message and broadcasts to room participants.
6. UI updates message list and seen state.

## Wishlist Flow

Wishlist state is exposed through `contexts/WishlistContext.tsx`.

```text
Listing card
  -> user toggles wishlist
  -> context updates local UI
  -> backend /api/wishlist persists item
  -> wishlist page displays saved items
```

Supported wishlist targets:

```text
HOTEL
TOUR
RENTAL
ACTIVITY
```

## Host Workflow

### Host Onboarding

```text
/host/signup
  -> HostSignupForm
  -> creates USER plus pending Host profile or updates host intent
  -> waits for verification/approval before host workspace access
```

### KYC

```text
/host/kyc
  -> collect personal/business identity details
  -> upload documents
  -> submit to backend
  -> admin reviews in /admin/kyc
```

### Tour Management

```text
/host/tours
  -> list host-owned tours
  -> create/edit tour
  -> submit listing for review
  -> backend sets status PENDING_REVIEW
  -> admin approves/rejects
```

### Participants And Bookings

```text
/host/bookings
/host/bookings/[bookingId]
/host/tours/[id]/participants
```

Hosts review booking records, traveler records, participant status, join requests, and operational details.

## Admin Workflow

Admin pages are grouped under `/admin`.

Admin responsibilities:

- Review users.
- Approve or reject hosts.
- Review KYC applications.
- Approve or reject listings.
- Monitor bookings.
- Review payouts.
- Moderate posts.
- Track analytics.

Frontend admin pages call backend admin endpoints such as:

```text
/api/admin/dashboard
/api/admin/users
/api/admin/users/[id]
/api/admin/hosts
/api/admin/hosts/[id]
/api/admin/kyc
/api/admin/kyc/[id]
/api/admin/listings
/api/admin/listings/[type]/[id]
/api/admin/bookings
/api/admin/bookings/[id]
/api/admin/payouts
/api/admin/payouts/[id]
/api/admin/posts
```

## Activity Flow

```text
/activities
  -> list activities
  -> Activity card selected
  -> /activities/[slug]
  -> show activity detail
```

The backend has Activity, ActivitySlot, ActivityBooking, ActivityPayment, and ActivityBookingTimeline models.

## Profile And Bookings Flow

```text
/profile
  -> reads current authenticated user
  -> displays or edits profile details

/my-bookings
  -> calls backend my-bookings endpoint
  -> groups bookings by status
  -> allows inspection or cancellation where supported
```

## Upload Flow

Upload-capable UI uses reusable upload controls such as `PhotoUploader`.

```text
User selects file
  -> frontend validates file
  -> POST /api/upload
  -> backend uploads to configured storage provider
  -> backend returns URL
  -> frontend stores URL in form state
```

## Error Handling Flow

Client request errors should pass through `getApiErrorMessage()`.

Common UI behavior:

```text
try request
  -> success updates state/cache
  -> failure extracts backend message
  -> show inline error or toast
```

Global route errors are handled by:

```text
app/error.tsx
app/not-found.tsx
```

## Environment Variables

Frontend commonly needs:

```text
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_public_razorpay_key
```

Do not commit `.env.local`; it is ignored by Git.

## Local Development Flow

Start backend first:

```bash
cd D:\GetHotelsNextjs\Travels_Pro\Travels_backend
npm run dev
```

Start frontend:

```bash
cd D:\GetHotelsNextjs\Travels_Pro\Travels_frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

Expected API target:

```text
http://localhost:4000/api
```

## Production Deployment Flow

1. Deploy backend API separately.
2. Set frontend `BACKEND_API_URL` to the deployed backend origin.
3. Set public payment keys in frontend environment.
4. Set private credentials only in backend environment.
5. Build frontend with `npm run build`.
6. Start with `npm run start`.

## Git And Ignored Files

Ignored frontend files include:

```text
node_modules/
.next/
out/
build/
.env*
logs/
*.log
*.tsbuildinfo
next-env.d.ts
```

Do not commit secrets or generated build output.

## Common Failure Points

### API Requests Return 500 With ECONNREFUSED

Cause:

```text
Frontend proxy is targeting backend URL, but backend is not running.
```

Fix:

```bash
cd Travels_backend
npm run dev
```

### Location Detection Fails

Causes:

- Browser blocks GPS permission.
- Backend is not running.
- `OPENCAGE_API_KEY` is missing in backend.
- External IP/GPS provider is unavailable.

Fallback behavior should show `India`.

### Auth State Looks Wrong

Causes:

- Stale `localStorage.user`.
- Backend `/api/auth/me` returns different role data.
- Browser has old local demo users.

Fix:

```text
Clear site storage and log in again.
```

## Feature Ownership Map

```text
Auth                  contexts/AuthContext.tsx, components/auth
Navigation            components/layout/Header, components/layout/Footer
Search/location       components/search
Home page             components/sections, components/HomePage.tsx
Tours                 app/tours, components/tour, lib/tours.ts
Tour booking          TourBookingWizard, traveler validators, Redux wizard slice
Host dashboard        app/host, components/host
Admin dashboard       app/admin
Wishlist              contexts/WishlistContext.tsx, app/wishlist
API client            lib/axios.ts
Global state          store/*
```
