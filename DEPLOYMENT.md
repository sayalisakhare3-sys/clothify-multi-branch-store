# Production deployment

The current deployment plan is a Railway-hosted Express API and PostgreSQL
database, with the Next.js frontend deployed separately on Vercel. This keeps
the frontend and API independently deployable. Do not connect a custom domain
or change GoDaddy/Cloudflare DNS until the existing records are inventoried
and a separate cutover is approved.

## 1. Pre-deployment gate

- Deploy the reviewed `main` commit to a new project/service; do not overwrite
  the existing live project.
- Run `npm run check:backend`, frontend lint/typecheck, and
  `npm run build:frontend`.
- Identify the production database and preserve its data. Keep the existing
  PostgreSQL database unless a separate migration to Railway PostgreSQL is
  approved, backed up, and restore-tested. Never use local/demo data.
- Keep secrets in provider environment settings only. Do not copy local `.env`
  files or send secret values through chat.

## 2. Railway API and PostgreSQL

1. Create a new Railway project and connect the GitHub repository
   `sayalisakhare3-sys/clothify-multi-branch-store`, branch `main`.
2. Set the API service root directory to `backend` and start command to
   `npm start`. Railway provides the `PORT`; the API listens on it.
3. Configure `DATABASE_URL` as a Railway secret variable for the approved
   production PostgreSQL database. If switching to Railway PostgreSQL, first
   migrate and verify required production data; do not silently switch to an
   empty database.
4. Set a newly generated `JWT_SECRET` and a temporary `CORS_ORIGIN` for the
   Vercel frontend URL. `CORS_ORIGIN` accepts comma-separated exact origins.
5. Verify the migration status and a restorable backup, then apply pending
   migrations once with the approved production database selected:

   ```bash
   cd backend
   npx prisma migrate deploy
   ```

6. Configure Railway's health check path as `/health`. Confirm it responds
   successfully and inspect startup/runtime logs for database or migration
   errors. Do not automatically seed demo users or sample sales into
   production.

## 3. Vercel frontend

1. Create a **new** Vercel project from the same GitHub repository and select
   `frontend` as its root directory. Leave the existing Vercel project
   untouched.
2. Set `NEXT_PUBLIC_API_URL` to the Railway API origin followed by `/api`,
   such as `https://your-api.up.railway.app/api`. This value is embedded at
   build time; redeploy after changing it.
3. Deploy and verify the generated Vercel URL. Then set that exact origin in
   Railway's `CORS_ORIGIN` and redeploy the API.
4. Keep custom domains and DNS unchanged for this stage. Connect a domain only
   after both default provider URLs pass acceptance checks and current DNS
   records have been recorded.

## 4. Release acceptance checks

- Frontend loads over HTTPS and can reach the API without CORS errors.
- API `/health` is healthy; login, role/branch access, and logout work.
- Verify product/branch reads and a controlled sale/return workflow against
  production-safe test data; never test by mutating real customer sales.
- Review Railway and Vercel logs for 5xx responses, uncaught errors, missing
  variables, and database connection failures.
- Confirm production backups and a tested restore procedure before onboarding
  customers.

## 5. Reliability and growth

- Define SLOs for availability and latency; alert on 5xx rate, p95 latency,
  database connection saturation, CPU/memory, and failed health checks.
- Use structured logs with request/correlation IDs and error monitoring.
  Redact credentials, JWTs, and personal data from logs.
- Load-test a staging environment gradually with representative traffic.
  Do not assume a user-count target is a capacity estimate or load-test
  production without an approved window.
- Scale API instances only after measuring CPU, memory, latency, and database
  limits. Keep database connection pools within the PostgreSQL connection
  budget; use a managed pooler if required.
- Add indexes from measured query plans, cache only safe high-read data, and
  move slow/long-running work to a queue rather than blocking API requests.
- Use backward-compatible expand/migrate/contract database changes. Roll back
  application releases quickly; recover database changes with a tested
  forward-fix or restore plan, not an unreviewed destructive rollback.
- Maintain a documented incident owner, status-update channel, rollback
  procedure, backup retention policy, and recovery-time/recovery-point goals.
