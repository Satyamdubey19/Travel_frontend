# Frontend API Client Module

## Purpose

The API client centralizes HTTP calls from frontend components and contexts to backend APIs.

## Source Files

```text
lib/axios.ts
next.config.ts
utils/api-response.ts
utils/admin-query.ts
```

## Client Configuration

```ts
baseURL: "/api"
withCredentials: true
```

The frontend uses `/api/*` URLs. Next.js rewrites these requests to the backend origin configured by `BACKEND_API_URL`.

## Environment

```text
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=public_key
```

## Request Flow

```text
Component/context/hook
  -> api.get/post/patch/delete(...)
  -> /api path
  -> Next.js rewrite
  -> backend API
  -> response/error
  -> UI state, context state, Redux, or query cache
```

## Error Handling

Use `getApiErrorMessage(error, fallback)` to normalize backend error payloads.

Expected backend shapes:

```json
{ "error": "message" }
```

```json
{ "message": "message" }
```

## Testing Notes

```text
Backend down should surface useful request errors.
401 should route or prompt login where needed.
403 should show permission messaging.
Validation errors should display backend error text.
Credentials/cookies should be sent on auth-protected calls.
```
