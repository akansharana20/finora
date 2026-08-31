# HMRC Making Tax Digital (MTD) VAT Integration — Finora V1

## 1. Overview

Finora includes a built-in integration engine for HMRC VAT (Making Tax Digital) Notice 700/22.

## 2. API Architecture

The integration logic is decoupled into 3 clear layers:
- **`HmrcClient`**: Low-level OAuth redirect builder, obligation fetcher, and return submission client with mock fallback.
- **`HmrcService`**: High-level business logic connecting firm VRN, managing token persistence, and mapping Finora financial records to the 9 HMRC VAT boxes.
- **`HmrcController` / `hmrc.routes`**: REST API endpoints for frontend interaction (`/api/hmrc/connect`, `/api/hmrc/callback`, `/api/hmrc/status`, `/api/hmrc/obligations/sync`, `/api/hmrc/returns/:periodKey/submit`).

## 3. HMRC 9-Box Mapping Logic

1. **Box 1**: Total VAT due on sales invoices in period.
2. **Box 2**: Total VAT due on acquisitions from EC member states.
3. **Box 3**: Total VAT due (`Box 1 + Box 2`).
4. **Box 4**: Total VAT reclaimed on business expenses/purchases in period.
5. **Box 5**: Net VAT payable to HMRC or reclaimable (`Box 3 - Box 4`).
6. **Box 6**: Total value of sales excluding VAT.
7. **Box 7**: Total value of purchases excluding VAT.
8. **Box 8**: Total value of goods supplied to EC member states.
9. **Box 9**: Total value of goods acquired from EC member states.

## 4. Sandbox vs Mock vs Production

When `INTEGRATION_MODE=mock`:
- Returns standard test sandbox responses without failing when live credentials are absent.
- Produces verifiable correlation receipts (`HMRC-SUB-...`).
