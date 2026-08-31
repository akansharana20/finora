# Xero Accounting Integration — Finora V1

## 1. Overview

Finora provides an OAuth 2.0 integration architecture with Xero to synchronize customer contacts and sales invoices.

## 2. Synchronization Flow (Xero -> Finora)

1. User connects Xero from `/integrations/xero`.
2. OAuth redirect generates mock/live tenant authorization.
3. User triggers `/api/xero/sync`.
4. Contacts fetched from Xero are upserted into Finora `Customer` directory.
5. Invoices fetched from Xero are created in Finora `Invoice` ledger with accurate line items, VAT rates, and balance states.
6. Execution summary records numbers of contacts and invoices processed.
