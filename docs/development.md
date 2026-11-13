# Development Guide

## Applications

Clothify is intentionally maintained as one frontend and one backend. Domain boundaries are represented by feature/module folders rather than separate applications.

## Start locally

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
2. Copy `frontend/.env.example` to `frontend/.env.local`.
3. Install dependencies in both `backend/` and `frontend/`.
4. Start the API on port 5000.
5. Start Next.js on port 3000.

## Authentication

All store/catalog/inventory APIs require a Bearer JWT. Login is the only authentication endpoint that is public. The frontend API client automatically attaches the token stored in `localStorage`.

## Database

The Prisma contract and migration history under `backend/prisma` and `backend/migrations` are the source of truth. Do not edit generated contract artifacts by hand; make schema changes through the project migration workflow.

Apply pending migrations and regenerate the Prisma client from `backend/`:

```bash
npx prisma migrate deploy
npx prisma generate
```

The commerce routes are protected by the same bearer-token middleware as the existing store-management APIs. Cashier requests are scoped to the cashier's assigned branch, while checkout and return operations validate and adjust inventory inside database transactions.

## Adding a feature

Frontend:

- Add a route under `frontend/app/<feature>/page.tsx`.
- Put feature UI/state under `frontend/features/<feature>/`.
- Keep reusable API calls in `frontend/lib/api.ts` until a dedicated service layer is justified.

Backend:

- Add a domain module under `backend/src/modules/<feature>/`.
- Keep routes thin and business logic in services/controllers.
- Register the route once in `backend/src/app.js`.
- Protect non-public routes with `authenticateToken` and apply role authorization where required.

Commerce feature routes are `/pos`, `/sales`, `/invoices`, `/returns`, `/restock`, and `/intelligence`.
