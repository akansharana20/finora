# Finora — UK Accounting & Financial Management Platform

Finora is a UK accounting and financial management web platform built for SMEs and accounting practices. It provides double-entry invoicing, expense recording, payment tracking, automated UK MTD VAT calculation and HMRC submissions, executive financial reporting, and role-based multi-tenancy.

---

## Architecture

Finora is architected as an npm workspace monorepo:

- **`apps/web`**: React 18 frontend built with Vite, TypeScript, Tailwind CSS, and Lucide React icons.
- **`apps/api`**: Express REST API backend built with Node.js, TypeScript, Zod validation, Helmet, and CORS.
- **Database**: PostgreSQL (compatible with Neon serverless PostgreSQL) managed via Prisma ORM (`Decimal` types for exact financial math).
- **Integration**: HMRC MTD VAT API (OAuth 2.0 / Sandbox & Production).

```
Finora/
├── apps/
│   ├── api/             # Express REST API Server
│   └── web/             # React 18 + Vite Frontend App
├── docs/                # Architectural & Compliance Documentation
├── prisma/
│   ├── schema.prisma    # Authoritative PostgreSQL Database Schema
│   └── seed.ts          # Comprehensive UK Accounting Demo Data Seeder
├── .env.example         # Environment Variable Template (No Real Secrets)
├── .gitignore           # Monorepo Git Ignore Policy
├── package.json         # Workspace Root Configuration
├── vercel.json          # Deployment Build Configuration
└── README.md
```

---

## Requirements

- **Node.js**: v18.x or v20.x (v20+ recommended)
- **npm**: v9.x or v10.x
- **PostgreSQL**: PostgreSQL 14+ or Neon serverless database instance

---

## Installation

Clone the repository and install workspace dependencies:

```bash
git clone https://github.com/akansharana20/Finora.git
cd Finora
npm install
```

---

## Environment Variables

Copy `.env.example` to create your local `.env` configuration:

```bash
cp .env.example .env
```

Fill in your local PostgreSQL connection string and security parameters:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finora_db?schema=public"

JWT_SECRET="your-32-character-random-secret-key-goes-here"
JWT_EXPIRES_IN=7d

HMRC_CLIENT_ID="your_hmrc_client_id"
HMRC_CLIENT_SECRET="your_hmrc_client_secret"
HMRC_REDIRECT_URI="http://localhost:4000/api/hmrc/callback"
HMRC_BASE_URL="https://test-api.service.hmrc.gov.uk"
HMRC_AUTH_BASE_URL="https://test-www.tax.service.gov.uk"
HMRC_ENVIRONMENT="sandbox"
HMRC_ENCRYPTION_KEY="32_byte_secret_key_for_encrypting_tokens"

VITE_API_URL="http://localhost:4000/api"
```

> [!IMPORTANT]
> Never commit real API credentials or `.env` files to git.

---

## Database Setup

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

---

---

## Run Locally

Start the backend API and frontend web application concurrently:

```bash
# Terminal 1 - Backend API Server (Port 4000)
npm run dev:api

# Terminal 2 - Frontend Web UI (Port 5173)
npm run dev:web
```

Or run default development server:
```bash
npm run dev
```

---

## Build & Test

Verify TypeScript compilation, linting, and production bundles:

```bash
# Run linting & typechecking across workspaces
npm run lint

# Run typecheck test suites across workspaces
npm run test

# Build production bundles for API and Web
npm run build
```

---

## Production Deployment on Vercel

Finora is designed as a monorepo where **`apps/web`** (Frontend) and **`apps/api`** (Backend API) are deployed as separate Vercel projects from the same GitHub repository (`akansharana20/finora`).

### 1. Backend API Project (`apps/api`)
1. Create a new Vercel Project and import `akansharana20/finora`.
2. Set **Root Directory** to `apps/api`.
3. Vercel automatically detects Node.js and builds using `npm run build` (`prisma generate && tsc`).
4. Configure Environment Variables in Vercel:
   - `DATABASE_URL`: Production PostgreSQL connection string (e.g., Neon / Supabase).
   - `JWT_SECRET`: Secure random key (minimum 32 characters).
   - `CORS_ORIGIN`: Deployed Web Frontend URL (e.g., `https://finora-web.vercel.app`).
   - `FRONTEND_URL`: Deployed Web Frontend URL (e.g., `https://finora-web.vercel.app`).
5. Verify API deployment:
   - `GET https://<your-api-domain>.vercel.app/api/health` returns `{"status":"ok","service":"finora-api",...}`.

### 2. Frontend Web App Project (`apps/web`)
1. Create a second Vercel Project and import `akansharana20/finora`.
2. Set **Root Directory** to `apps/web` (or leave default root with root `vercel.json`).
3. Framework Preset: **Vite** (Build: `npm run build`, Output: `dist`).
4. Configure Environment Variables in Vercel:
   - `VITE_API_URL`: Deployed API base URL (e.g., `https://finora-api-alpha.vercel.app/api`).
5. Redeploy frontend if `VITE_API_URL` is added after initial build.

### 3. Database Migration
Run the Prisma migration against your production PostgreSQL database:
```bash
DATABASE_URL="your-production-db-url" npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

---

## Integrations

Finora supports HMRC Making Tax Digital VAT in sandbox and production environments. Configure the HMRC API and OAuth endpoints with environment variables, connect a VAT-registered company, synchronize obligations, prepare returns, and submit them through the HMRC API.
