# Vercel deployment

Clothify has a Next.js frontend and an Express API, so deploy it as two Vercel
projects connected to this repository.

## 1. Deploy the API

Create a Vercel project for this repository and set its **Root Directory** to
`backend`. Use the Express framework preset if Vercel offers it; otherwise use
the default Node.js detection. The Express entry point is `backend/index.js`.

Add these environment variables to the API project for each environment:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Production PostgreSQL connection string. Use the provider's pooled connection URL where available. |
| `JWT_SECRET` | A new, randomly generated production secret. Do not reuse a development value. |
| `CORS_ORIGIN` | Exact frontend origin, including `https://`; comma-separated origins are supported. |

After setting up the production database, apply the checked-in migrations from
the `backend` directory using that database's credentials:

```bash
npx prisma migrate deploy
```

Deploy the API and verify its `/health` endpoint before deploying the frontend.

## 2. Deploy the frontend

Create a second Vercel project for the same repository and set its **Root
Directory** to `frontend`. Add this environment variable:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | The deployed API URL followed by `/api`, for example `https://your-api.vercel.app/api`. |

Deploy the frontend, then set its final production origin in the API project's
`CORS_ORIGIN` and redeploy the API if that value changed.

## 3. Production checks

- Confirm the frontend can load and sign in against the production API.
- Confirm the API `/health` endpoint responds successfully.
- Provision an initial production owner account through a controlled setup
  process; do not rely on local demo data or development credentials.
- Keep database URLs, JWT secrets, and other credentials in Vercel environment
  settings only. Never commit `.env` files or secrets.
