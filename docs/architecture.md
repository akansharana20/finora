# Architecture Specification — Finora V1

## 1. Overview

Finora is designed as a **Modular Monolith** application written in TypeScript across both frontend and backend workspace layers. It avoids microservice overhead while enforcing strict domain boundary separation and multi-tenant scoping.

## 2. Multi-Tenancy & Security Isolation

- Every financial entity (`Customer`, `Supplier`, `Invoice`, `Expense`, `Payment`, `VatReturn`, `AuditLog`) belongs to a `Firm` via `firmId`.
- Authentication middleware binds `req.firmId` to the request context upon JWT verification.
- Database services mandate `where: { firmId }` scoping on all Prisma queries, preventing cross-firm data leaks.

## 3. Role-Based Access Control (RBAC)

The system supports three hierarchical roles:
- **`ADMIN`**: Full administrative privileges (manage users, firm settings, integrations, accounting data).
- **`ACCOUNTANT`**: Full financial and tax operations (invoices, expenses, payments, VAT returns, integrations).
- **`USER`**: Operational access (view/create invoices and expenses, restricted firm configuration).

## 4. Deterministic Financial Precision

Money values in Finora are stored using PostgreSQL `db.Decimal(12, 2)` and calculated on the backend using `decimal.js`. Floating-point arithmetic is explicitly forbidden for line items, subtotals, VAT, and balance calculations.
