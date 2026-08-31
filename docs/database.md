# Database Schema & Entity Relational Mapping — Finora V1

## 1. Relational Entity Overview

The database schema (`prisma/schema.prisma`) defines 13 core relational models targeting PostgreSQL / Neon:

- **`Firm`**: Tenant root entity storing UK Companies House number, VRN, currency, and relations.
- **`User`**: System account linked to a firm with password hashing (`bcrypt`) and RBAC enum role.
- **`Customer`**: UK business client with billing address, UK postcode, and VAT number.
- **`Supplier`**: UK vendor record linked to operating expenses.
- **`Invoice`**: Double-entry sales invoice with server-side calculated `subtotal`, `vatTotal`, `total`, `amountPaid`, `balanceDue`, and statuses (`DRAFT`, `SENT`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`).
- **`InvoiceItem`**: Line item record with `quantity`, `unitPrice`, `vatRate`, `vatAmount`, and `total`.
- **`Expense`**: Operating expense entry categorized under Software, Office, Travel, Utilities, Professional Services, Marketing, Equipment, or Other.
- **`Payment`**: Internal/external payment transaction log linking payments to invoices and updating balance states.
- **`VatRate`**: Standard (20%), Reduced (5%), Zero (0%), Exempt (0%) VAT rates per firm.
- **`VatObligation`**: Quarterly VAT obligations retrieved from HMRC.
- **`VatReturn`**: HMRC MTD 9-Box VAT Return record storing submitted correlation IDs.
- **`HmrcConnection`**: Encrypted OAuth access tokens, refresh tokens, and VRN state for HMRC MTD.
- **`XeroConnection`**: Encrypted OAuth tokens and tenant ID for Xero synchronization.
- **`AuditLog`**: Immutable security log tracking all critical mutations.
