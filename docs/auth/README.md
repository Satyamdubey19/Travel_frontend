# Frontend Auth Documentation

Frontend auth documentation lives in this folder.

## Files

```text
AUTH_FLOW.md
  Auth context, login, signup, host intent, logout, local fallback, and route behavior.
```

## Current Auth Rules

```text
Backend registration does not log users in.
Credential login requires verified email.
Public host signup creates a pending Host profile on the backend, not HOST access.
Frontend should trust backend role/isHost from /api/auth/me.
LocalStorage auth fallback is development-only and not production security.
```
