# UI And State Module

## Purpose

This module covers shared UI primitives, Redux global state, TanStack Query server state, loading/error patterns, and reusable design conventions.

## Source Files

```text
components/ui/*
store/store.ts
store/hooks.ts
store/modalSlice.ts
store/notificationSlice.ts
store/socketSlice.ts
store/tourBookingWizardSlice.ts
app/providers.tsx
lib/utils.ts
types/ui.ts
types/component-props.ts
```

## Redux Slices

```text
modal
  shared modal open/close state

notifications
  in-app notification state

socket
  socket connection metadata

tourBookingWizard
  tour booking multi-step state
```

## TanStack Query

Configured in `app/providers.tsx`.

```text
staleTime: 30 seconds
refetchOnWindowFocus: false
query retry: 1
mutation retry: 0
```

## UI Components

Common primitives:

```text
Button
Input
Card
Modal
Alert
Checkbox
ToggleSwitch
Spinner
StatusBadge
StatCard
PhotoUploader
EmptyState
```

## Testing Notes

```text
Shared controls should be keyboard accessible.
Buttons should show disabled/loading states.
Inputs should display validation errors without layout shift.
Modal focus should be trapped where applicable.
Redux state should not persist sensitive auth secrets.
Query mutations should handle loading, success, and error states.
```
