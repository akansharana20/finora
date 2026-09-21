# Vercel & Production Deployment Guide — Finora V1

## 1. Monorepo Deployment Strategy

Finora is optimized for serverless multi-app deployment on Vercel:

- **Frontend (`apps/web`)**: Built via `vite build` to static HTML/JS/CSS output.
- **Backend API (`apps/api`)**: Exported Express application server compatible with Vercel Serverless Functions (`api/index.ts`).

## 2. Environment Variable Setup

Ensure the following variables are configured in the Vercel project dashboard:
- `DATABASE_URL` (Neon PostgreSQL Pooled Connection URL)
- `JWT_SECRET`
- `INTEGRATION_MODE` (`sandbox` for HMRC Sandbox; `production` for live MTD)
- `HMRC_CLIENT_ID`, `HMRC_CLIENT_SECRET`, `HMRC_REDIRECT_URI`
- `HMRC_BASE_URL`, `HMRC_AUTH_BASE_URL`, `HMRC_ENVIRONMENT`
- `HMRC_ENCRYPTION_KEY`
- `HMRC_STATE_SECRET` (recommended; otherwise `JWT_SECRET` is used)
- `FRONTEND_URL` and `CORS_ORIGIN`
- `VITE_API_URL` (Production API domain URL)

## 3. Database Migration in Production

The HMRC OAuth flow persists single-use state in `hmrc_oauth_states`. Apply the
tracked migration to the Production database before deploying the API:

```bash
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

Do not run `db push` against a production database as part of the normal
deployment workflow. Review and deploy tracked migrations instead.

The API must have the HMRC Sandbox variables described in
[hmrc-sandbox-checklist.md](hmrc-sandbox-checklist.md) configured before the
first connection attempt.
