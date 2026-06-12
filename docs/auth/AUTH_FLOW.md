# Frontend Auth Flow

## Purpose

This document explains how the frontend handles authentication state, login, signup, host onboarding intent, Google login, logout, and protected UI behavior.

## Source Files

```text
contexts/AuthContext.tsx
components/auth/LoginForm.tsx
components/auth/SignupForm.tsx
components/auth/HostSignupForm.tsx
app/login/page.tsx
app/signup/page.tsx
app/host/signup/page.tsx
app/forgot-password/page.tsx
lib/axios.ts
types/auth.ts
types/auth-forms.ts
```

## Backend Contract

Frontend calls the backend through the shared axios client:

```text
baseURL: /api
withCredentials: true
```

Important current backend behavior:

```text
POST /api/auth/register creates account but does not set token cookie.
GET /api/auth/verify verifies email.
POST /api/auth/login requires verified email and sets token cookie.
PATCH /api/auth/me with activateHost=true creates/updates pending Host profile but does not grant HOST.
POST /api/auth/logout clears/revokes token.
GET /api/auth/me returns canonical user state.
```

## Session Hydration

```text
AuthProvider mounts
  -> read localStorage.user for quick UI hydration
  -> call GET /api/auth/me
  -> if backend returns user, replace local state
  -> if backend fails and local user exists, keep local dev fallback state
  -> if no local user and backend fails, user=null
```

Production note:

```text
Do not treat localStorage.user as secure auth.
Backend /api/auth/me is the source of truth.
```

## Login Flow

```text
LoginForm
  -> AuthContext.login(email, password, expectedRole?)
  -> POST /api/auth/login
  -> backend verifies email/password/role
  -> backend sets httpOnly token cookie
  -> frontend stores sanitized user in localStorage
  -> redirect based on returned role
```

Redirect rule:

```text
ADMIN -> /admin
HOST  -> /host
USER  -> /
```

Expected login errors:

```text
Incorrect email or password
Please verify your email before logging in
This account does not have host access
This account does not have admin access
Too many requests. Please try again later.
Invalid request origin
```

## Signup Flow

```text
SignupForm
  -> POST /api/auth/register
  -> backend creates USER account
  -> backend sends verification email
  -> frontend should show verify-email message
  -> user verifies email from link
  -> user logs in separately
```

Host signup:

```text
HostSignupForm
  -> POST /api/auth/register with role=host and businessName
  -> backend creates USER account and pending Host profile
  -> no HOST access until backend/admin approval grants it
```

Frontend requirement:

```text
Do not assume successful host signup means isHost=true.
Always use /api/auth/me or login response role/isHost for access decisions.
```

## Become Host Intent

```text
Logged-in USER
  -> HostSignupForm or host onboarding calls becomeHost()
  -> PATCH /api/auth/me with activateHost=true and businessName
  -> backend creates/updates pending Host profile
  -> returned user remains USER unless backend has already promoted role
```

Frontend requirement:

```text
Only show host workspace when user.roles includes HOST or backend returns isHost true with HOST role policy.
Pending host should see onboarding/pending approval messaging.
```

## Google Login

```text
LoginForm / SignupForm
  -> signIn("google", { callbackUrl: "/api/auth/google-login" })
  -> NextAuth Google flow
  -> backend bridge creates custom token cookie
  -> redirect to app
  -> AuthProvider hydrates with /api/auth/me
```

Backend requires Google `email_verified=true`.

## Logout Flow

```text
logout()
  -> remove localStorage.user
  -> POST /api/auth/logout
  -> signOut({ redirect: false })
  -> UI returns to unauthenticated state
```

## Local Fallback Accounts

`AuthContext` currently includes browser localStorage fallback accounts for development/demo continuity.

```text
This is not production authentication.
Do not rely on local fallback roles for server-side access.
Clear site storage if local state looks stale.
```

## Testing Checklist

```text
Register shows verification-required message and does not treat user as logged in.
Unverified login shows backend verification error.
Verified login stores user and hydrates /api/auth/me.
Host signup does not open /host unless backend grants HOST.
becomeHost creates pending profile but does not force HOST locally.
Logout clears local user and backend cookie.
Local stale user is replaced by /api/auth/me response.
API down fallback only works as dev/demo behavior.
```
