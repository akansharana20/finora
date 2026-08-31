# Vercel & Production Deployment Guide — Finora V1

## 1. Monorepo Deployment Strategy

Finora is optimized for serverless multi-app deployment on Vercel:

- **Frontend (`apps/web`)**: Built via `vite build` to static HTML/JS/CSS output.
- **Backend API (`apps/api`)**: Exported Express application server compatible with Vercel Serverless Functions (`api/index.ts`).

## 2. Environment Variable Setup

Ensure the following variables are configured in the Vercel project dashboard:
- `DATABASE_URL` (Neon PostgreSQL Pooled Connection URL)
- `JWT_SECRET`
- `INTEGRATION_MODE` (`production` or `sandbox`)
- `HMRC_CLIENT_ID`, `HMRC_CLIENT_SECRET`, `HMRC_REDIRECT_URI`
- `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, `XERO_REDIRECT_URI`
- `VITE_API_URL` (Production API domain URL)

## 3. Database Migration in Production

Before deploying a new version:
```bash
npx prisma db push
```
or run migrations against Neon PostgreSQL.
