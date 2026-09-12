CREATE TYPE "Role" AS ENUM ('ADMIN', 'ACCOUNTANT', 'USER');
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "ExpensePaymentStatus" AS ENUM ('PAID', 'UNPAID', 'PARTIAL');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
CREATE TYPE "VatObligationStatus" AS ENUM ('OPEN', 'FULFILLED');
CREATE TYPE "VatReturnStatus" AS ENUM ('DRAFT', 'SUBMITTED');

CREATE TABLE "firms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyNumber" TEXT,
    "vatNumber" TEXT,
    "address" TEXT,
    "postcode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'GB',
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "city" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "county" TEXT,
    "financialYearStart" INTEGER NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "legalName" TEXT,
    "vatRegistered" BOOLEAN NOT NULL DEFAULT true,
    "vatScheme" TEXT NOT NULL DEFAULT 'STANDARD',
    CONSTRAINT "firms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "postcode" TEXT,
    "vatNumber" TEXT,
    "notes" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "postcode" TEXT,
    "vatNumber" TEXT,
    "notes" TEXT,
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vatTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL,
    "vatAmount" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "supplierId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "vatAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(12,2) NOT NULL,
    "paymentStatus" "ExpensePaymentStatus" NOT NULL DEFAULT 'PAID',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "expenseId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCEEDED',
    "provider" TEXT NOT NULL DEFAULT 'INTERNAL',
    "providerTxId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vat_rates" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vat_rates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vat_obligations" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "startPeriod" TIMESTAMP(3) NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "VatObligationStatus" NOT NULL DEFAULT 'OPEN',
    "periodKey" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vat_obligations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vat_returns" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "startPeriod" TIMESTAMP(3) NOT NULL,
    "endPeriod" TIMESTAMP(3) NOT NULL,
    "box1" DECIMAL(12,2) NOT NULL,
    "box2" DECIMAL(12,2) NOT NULL,
    "box3" DECIMAL(12,2) NOT NULL,
    "box4" DECIMAL(12,2) NOT NULL,
    "box5" DECIMAL(12,2) NOT NULL,
    "box6" DECIMAL(12,2) NOT NULL,
    "box7" DECIMAL(12,2) NOT NULL,
    "box8" DECIMAL(12,2) NOT NULL,
    "box9" DECIMAL(12,2) NOT NULL,
    "status" "VatReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "hmrcCorrelationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vat_returns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hmrc_connections" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "vrn" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "environment" TEXT NOT NULL DEFAULT 'sandbox',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hmrc_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "xero_connections" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "tenantId" TEXT,
    "tenantName" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "environment" TEXT NOT NULL DEFAULT 'demo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "xero_connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_firmId_idx" ON "users"("firmId");
CREATE INDEX "customers_firmId_idx" ON "customers"("firmId");
CREATE INDEX "suppliers_firmId_idx" ON "suppliers"("firmId");
CREATE UNIQUE INDEX "invoices_firmId_invoiceNumber_key" ON "invoices"("firmId", "invoiceNumber");
CREATE INDEX "invoices_firmId_idx" ON "invoices"("firmId");
CREATE INDEX "invoices_customerId_idx" ON "invoices"("customerId");
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");
CREATE INDEX "expenses_firmId_idx" ON "expenses"("firmId");
CREATE INDEX "expenses_supplierId_idx" ON "expenses"("supplierId");
CREATE INDEX "payments_firmId_idx" ON "payments"("firmId");
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");
CREATE INDEX "payments_expenseId_idx" ON "payments"("expenseId");
CREATE UNIQUE INDEX "vat_rates_firmId_code_key" ON "vat_rates"("firmId", "code");
CREATE INDEX "vat_rates_firmId_idx" ON "vat_rates"("firmId");
CREATE UNIQUE INDEX "vat_obligations_firmId_periodKey_key" ON "vat_obligations"("firmId", "periodKey");
CREATE INDEX "vat_obligations_firmId_idx" ON "vat_obligations"("firmId");
CREATE UNIQUE INDEX "vat_returns_firmId_periodKey_key" ON "vat_returns"("firmId", "periodKey");
CREATE INDEX "vat_returns_firmId_idx" ON "vat_returns"("firmId");
CREATE UNIQUE INDEX "hmrc_connections_firmId_key" ON "hmrc_connections"("firmId");
CREATE UNIQUE INDEX "xero_connections_firmId_key" ON "xero_connections"("firmId");
CREATE INDEX "audit_logs_firmId_idx" ON "audit_logs"("firmId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

ALTER TABLE "users" ADD CONSTRAINT "users_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customers" ADD CONSTRAINT "customers_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vat_rates" ADD CONSTRAINT "vat_rates_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vat_obligations" ADD CONSTRAINT "vat_obligations_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vat_returns" ADD CONSTRAINT "vat_returns_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hmrc_connections" ADD CONSTRAINT "hmrc_connections_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "xero_connections" ADD CONSTRAINT "xero_connections_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;