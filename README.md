# Travels Frontend

Frontend application for the Travels/GetHotels project. This app is built with Next.js, React, TypeScript, Tailwind CSS, Redux Toolkit, TanStack Query, and Prisma-generated client types where needed.

## Requirements

- Node.js 20 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not available, create `.env.local` manually and add the frontend environment values required by the app.

Run the development server:

```bash
npm run dev
```

API requests under `/api/*` are proxied to the backend. By default, the frontend expects the backend at:

```text
http://localhost:4000
```

Override this with `BACKEND_API_URL` if the backend runs somewhere else.

The app runs on the default Next.js development URL:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
app/          Next.js app routes and pages
components/   Shared UI components
contexts/     React context providers
hooks/        Custom React hooks
lib/          Shared frontend utilities and clients
public/       Static assets
store/        Redux store and slices
types/        TypeScript types
utils/        Helper functions
validators/  Validation schemas
```

## Git Notes

Generated files, local environment files, logs, `node_modules`, and Next.js build output are ignored through `.gitignore`.
