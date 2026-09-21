import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
// Load root .env before any Prisma module is initialised so DATABASE_URL is present.
dotenvConfig({ path: resolve(__dirname, '../../../.env') });

import assert from 'assert';
import { Role } from '@prisma/client';
import { isUserAuthorizedForFirm, authenticate } from '../src/middleware/auth';
import { FirmsService } from '../src/modules/firms/firms.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { VatService } from '../src/modules/vat/vat.service';
import { ExpensesService } from '../src/modules/expenses/expenses.service';
import { PaymentsService } from '../src/modules/payments/payments.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '../src/utils/errors';
import prisma, { getPrisma } from '../src/config/db';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('🧪 Starting Finora Phase 1 Multi-Company & Isolation Tests...\n');

  const JWT_SECRET = process.env.JWT_SECRET || 'finora-dev-jwt-secret-key-change-in-production-min-32-chars';

  // --------------------------------------------------------------------------
  // TEST 1: Company Creation Input Validation
  // --------------------------------------------------------------------------
  console.log('Test 1: Company Creation Input Validation');
  {
    // Empty name
    let caughtEmptyName: any = null;
    try {
      await FirmsService.create({ name: '   ' });
    } catch (err) {
      caughtEmptyName = err;
    }
    assert.ok(caughtEmptyName instanceof BadRequestError, 'Empty name must throw BadRequestError');
    assert.strictEqual(caughtEmptyName.statusCode, 400);

    // Invalid financial year start month (> 12)
    let caughtFys: any = null;
    try {
      await FirmsService.create({ name: 'Test Corp Ltd', financialYearStart: 13 });
    } catch (err) {
      caughtFys = err;
    }
    assert.ok(caughtFys instanceof BadRequestError, 'Invalid financial year start > 12 must throw BadRequestError');

    // Invalid financial year start month (< 1)
    let caughtFysLow: any = null;
    try {
      await FirmsService.create({ name: 'Test Corp Ltd', financialYearStart: 0 });
    } catch (err) {
      caughtFysLow = err;
    }
    assert.ok(caughtFysLow instanceof BadRequestError, 'Invalid financial year start < 1 must throw BadRequestError');

    // Invalid VAT scheme
    let caughtVatScheme: any = null;
    try {
      await FirmsService.create({ name: 'Test Corp Ltd', vatScheme: 'INVALID_SCHEME' });
    } catch (err) {
      caughtVatScheme = err;
    }
    assert.ok(caughtVatScheme instanceof BadRequestError, 'Invalid VAT scheme must throw BadRequestError');
  }
  console.log('✅ Passed Test 1: Company creation validation rejects invalid inputs.\n');

  // --------------------------------------------------------------------------
  // TEST 2: Verify No Fabricated Dummy VAT Obligations on Creation
  // --------------------------------------------------------------------------
  console.log('Test 2: Newly Created Company Receives ZERO Fabricated VAT Obligations');
  {
    // Mock $transaction on the underlying Prisma singleton (the Proxy ignores target assignments).
    const prismaClient = getPrisma();
    const originalTransaction = (prismaClient as any).$transaction;
    let vatObligationCreated = false;
    let vatRatesCreated = false;
    let firmCreated = false;
    let auditLogCreated = false;

    const mockTx = {
      firm: {
        create: async (args: any) => {
          firmCreated = true;
          return {
            id: 'mock-firm-uuid-1',
            name: args.data.name,
            currency: 'GBP',
            country: 'GB',
            vatScheme: 'STANDARD',
            isActive: true,
          };
        },
      },
      vatRate: {
        createMany: async (_args: any) => {
          vatRatesCreated = true;
          return { count: 4 };
        },
      },
      user: {
        findUnique: async (_args: any) => ({ role: Role.ADMIN }),
      },
      firmMembership: {
        create: async (_args: any) => ({ id: 'mock-membership-1' }),
      },
      vatObligation: {
        create: async (_args: any) => {
          vatObligationCreated = true;
          return { id: 'dummy-ob' };
        },
      },
      auditLog: {
        create: async (_args: any) => {
          auditLogCreated = true;
          return { id: 'dummy-log' };
        },
      },
    };

    // Override $transaction directly on the PrismaClient instance so the Proxy picks it up.
    (prismaClient as any).$transaction = async (fn: any) => fn(mockTx);

    try {
      const result = await FirmsService.create({ name: 'New Client Enterprise Ltd' }, 'admin-123');
      assert.strictEqual(result.name, 'New Client Enterprise Ltd');
      assert.strictEqual(firmCreated, true, 'Firm record should be created');
      assert.strictEqual(vatRatesCreated, true, 'Standard UK VAT rates should be initialized');
      assert.strictEqual(auditLogCreated, true, 'FIRM_CREATED audit log must be recorded');
      assert.strictEqual(vatObligationCreated, false, 'CRITICAL: No dummy VAT obligation should be created!');
    } finally {
      (prismaClient as any).$transaction = originalTransaction;
    }
  }
  console.log('✅ Passed Test 2: Fabricated VAT obligations removed from company creation.\n');

  // --------------------------------------------------------------------------
  // TEST 3: VAT Overview & Return Preparation for Company with No Obligations
  // --------------------------------------------------------------------------
  console.log('Test 3: VAT Overview Behavior with No Obligations (Clean Empty State)');
  {
    const originalFindManyObligations = prisma.vatObligation.findMany;
    const originalFindFirstObligation = prisma.vatObligation.findFirst;
    const originalFindManyInvoices = prisma.invoice.findMany;
    const originalFindManyExpenses = prisma.expense.findMany;
    const originalFindManyReturns = prisma.vatReturn.findMany;
    const originalFindUniqueHmrc = prisma.hmrcConnection.findUnique;

    (prisma.vatObligation as any).findMany = async () => [];
    (prisma.vatObligation as any).findFirst = async () => null;
    (prisma.invoice as any).findMany = async () => [];
    (prisma.expense as any).findMany = async () => [];
    (prisma.vatReturn as any).findMany = async () => [];
    (prisma.hmrcConnection as any).findUnique = async () => null;

    try {
      const overview = await VatService.getOverview('empty-firm-id');
      assert.strictEqual(overview.currentPeriod, null, 'currentPeriod must be null when no obligations exist');
      assert.strictEqual(overview.obligations.length, 0, 'Obligations array must be empty');
      assert.strictEqual(overview.returns.length, 0, 'Returns array must be empty');
      assert.strictEqual(Number(overview.liveCalculation.box1), 0, 'Live calculation box 1 must be 0.00');
      assert.strictEqual(Number(overview.liveCalculation.box5), 0, 'Live calculation box 5 must be 0.00');

      // Attempting to prepare a return for an obligation that does not exist should throw NotFoundError
      let caughtNotFound: any = null;
      try {
        await VatService.prepareVatReturn('empty-firm-id', '26C2');
      } catch (err) {
        caughtNotFound = err;
      }
      assert.ok(caughtNotFound instanceof NotFoundError, 'Preparing return with no obligation must throw NotFoundError');
      assert.strictEqual(caughtNotFound.statusCode, 404);
    } finally {
      prisma.vatObligation.findMany = originalFindManyObligations;
      prisma.vatObligation.findFirst = originalFindFirstObligation;
      prisma.invoice.findMany = originalFindManyInvoices;
      prisma.expense.findMany = originalFindManyExpenses;
      prisma.vatReturn.findMany = originalFindManyReturns;
      prisma.hmrcConnection.findUnique = originalFindUniqueHmrc;
    }
  }
  console.log('✅ Passed Test 3: VAT Overview returns null currentPeriod and rejects unbacked preparation.\n');

  // --------------------------------------------------------------------------
  // TEST 4: Firm Authorization Verification Function
  // --------------------------------------------------------------------------
  console.log('Test 4: Firm Authorization Logic (Primary Firm vs Created Firm vs Foreign Firm)');
  {
    const originalFindFirst = prisma.auditLog.findFirst;

    // 4A: Primary firm is always authorized
    const authPrimary = await isUserAuthorizedForFirm('user-admin-1', 'firm-acme', 'firm-acme');
    assert.strictEqual(authPrimary, true, 'Primary firm must always be authorized');

    // 4B: Firm created by this user is authorized
    (prisma.auditLog as any).findFirst = async (query: any) => {
      if (query.where.firmId === 'firm-created-by-user-1' && query.where.userId === 'user-admin-1') {
        return { id: 'audit-log-1' };
      }
      return null;
    };

    const authCreated = await isUserAuthorizedForFirm('user-admin-1', 'firm-acme', 'firm-created-by-user-1');
    assert.strictEqual(authCreated, true, 'Firm created by user must be authorized');

    // 4C: Foreign firm (e.g. Apex firm when user is Acme admin) is NOT authorized
    const authForeign = await isUserAuthorizedForFirm('user-admin-1', 'firm-acme', 'firm-apex');
    assert.strictEqual(authForeign, false, 'Foreign firm must NOT be authorized');

    // 4D: Invalid/empty firm ID is NOT authorized
    const authEmpty = await isUserAuthorizedForFirm('user-admin-1', 'firm-acme', '');
    assert.strictEqual(authEmpty, false, 'Empty target firmId must not be authorized');

    prisma.auditLog.findFirst = originalFindFirst;
  }
  console.log('✅ Passed Test 4: Firm authorization verifies ownership and blocks foreign firms.\n');

  // --------------------------------------------------------------------------
  // TEST 5: Auth Middleware Security & Cross-Tenant Access Enforcement
  // --------------------------------------------------------------------------
  console.log('Test 5: Auth Middleware - Cross-Company Access Control & x-firm-id Security');
  {
    const originalFindUniqueFirm = prisma.firm.findUnique;
    const originalFindFirstAudit = prisma.auditLog.findFirst;

    (prisma.firm as any).findUnique = async (query: any) => {
      if (query.where.id === 'firm-acme') return { id: 'firm-acme', isActive: true };
      if (query.where.id === 'firm-brighton') return { id: 'firm-brighton', isActive: true };
      if (query.where.id === 'firm-apex') return { id: 'firm-apex', isActive: true };
      if (query.where.id === 'firm-deactivated') return { id: 'firm-deactivated', isActive: false };
      return null;
    };

    (prisma.auditLog as any).findFirst = async (query: any) => {
      // User 'acme-admin-id' created 'firm-brighton', but NOT 'firm-apex'
      if (query.where.userId === 'acme-admin-id' && query.where.firmId === 'firm-brighton') {
        return { id: 'log-1' };
      }
      return null;
    };

    const acmeAdminToken = jwt.sign(
      { id: 'acme-admin-id', firmId: 'firm-acme', email: 'admin@acme.co.uk', name: 'Eleanor', role: Role.ADMIN },
      JWT_SECRET
    );

    const standardUserToken = jwt.sign(
      { id: 'acme-user-id', firmId: 'firm-acme', email: 'user@acme.co.uk', name: 'Sarah', role: Role.USER },
      JWT_SECRET
    );

    // Scenario A: Admin requests authorized company they created
    {
      const req: any = {
        headers: { authorization: `Bearer ${acmeAdminToken}`, 'x-firm-id': 'firm-brighton' },
        path: '/invoices',
      };
      let nextError: any = null;
      await authenticate(req, {} as any, (err) => { nextError = err; });
      assert.ok(nextError == null, 'Authorized company should succeed');
      assert.strictEqual(req.firmId, 'firm-brighton', 'req.firmId should be set to authorized requested company');
    }

    // Scenario B: Admin requests foreign company (Apex) -> MUST BE REJECTED (403)
    {
      const req: any = {
        headers: { authorization: `Bearer ${acmeAdminToken}`, 'x-firm-id': 'firm-apex' },
        path: '/invoices',
      };
      let nextError: any = null;
      await authenticate(req, {} as any, (err) => { nextError = err; });
      assert.ok(nextError instanceof ForbiddenError, 'Cross-company access to unowned firm must throw ForbiddenError');
      assert.strictEqual(nextError.statusCode, 403);
    }

    // Scenario C: Admin requests nonexistent company -> MUST BE REJECTED (404)
    {
      const req: any = {
        headers: { authorization: `Bearer ${acmeAdminToken}`, 'x-firm-id': 'non-existent-firm-123' },
        path: '/invoices',
      };
      let nextError: any = null;
      await authenticate(req, {} as any, (err) => { nextError = err; });
      assert.ok(nextError instanceof NotFoundError, 'Nonexistent company must throw NotFoundError');
      assert.strictEqual(nextError.statusCode, 404);
    }

    // Scenario D: Non-admin user tries to provide x-firm-id -> MUST BE LOCKED TO OWN FIRM
    {
      const req: any = {
        headers: { authorization: `Bearer ${standardUserToken}`, 'x-firm-id': 'firm-brighton' },
        path: '/invoices',
      };
      let nextError: any = null;
      await authenticate(req, {} as any, (err) => { nextError = err; });
      assert.ok(nextError == null);
      assert.strictEqual(req.firmId, 'firm-acme', 'Non-admin user must never be allowed to switch firmId');
    }

    // Scenario E: Stale x-firm-id on /auth/me gracefully falls back to home firm
    {
      const req: any = {
        headers: { authorization: `Bearer ${acmeAdminToken}`, 'x-firm-id': 'stale-or-unauthorized-firm' },
        path: '/me',
        originalUrl: '/api/auth/me',
      };
      let nextError: any = null;
      await authenticate(req, {} as any, (err) => { nextError = err; });
      assert.ok(nextError == null, '/auth/me should not fail on stale company ID');
      assert.strictEqual(req.firmId, 'firm-acme', '/auth/me should safely fall back to primary firmId');
    }

    prisma.firm.findUnique = originalFindUniqueFirm;
    prisma.auditLog.findFirst = originalFindFirstAudit;
  }
  console.log('✅ Passed Test 5: Auth middleware blocks unauthorized x-firm-id and protects tenants.\n');

  // --------------------------------------------------------------------------
  // TEST 6: Cross-Company Data Boundary Checks (Expenses & Payments)
  // --------------------------------------------------------------------------
  console.log('Test 6: Cross-Tenant Data Boundary Protection (Supplier & Expense References)');
  {
    // 6A: Expense cannot reference supplier of another company
    const originalSupplierFindFirst = prisma.supplier.findFirst;
    (prisma.supplier as any).findFirst = async (query: any) => {
      if (query.where.id === 'foreign-supplier-1' && query.where.firmId === 'firm-acme') {
        return null; // Foreign supplier doesn't belong to firm-acme
      }
      return null;
    };

    let caughtSupplierError: any = null;
    try {
      await ExpensesService.create('firm-acme', {
        supplierId: 'foreign-supplier-1',
        category: 'Software',
        description: 'Cross-tenant expense attempt',
        date: new Date(),
        amount: 100,
      });
    } catch (err) {
      caughtSupplierError = err;
    }
    assert.ok(caughtSupplierError instanceof BadRequestError, 'Cross-firm supplier reference must throw BadRequestError');
    prisma.supplier.findFirst = originalSupplierFindFirst;

    // 6B: Payment cannot reference expense of another company
    const originalExpenseFindFirst = prisma.expense.findFirst;
    (prisma.expense as any).findFirst = async (query: any) => {
      if (query.where.id === 'foreign-expense-1' && query.where.firmId === 'firm-acme') {
        return null; // Foreign expense doesn't belong to firm-acme
      }
      return null;
    };

    let caughtPaymentExpenseError: any = null;
    try {
      await PaymentsService.recordPayment('firm-acme', {
        expenseId: 'foreign-expense-1',
        amount: 50,
      });
    } catch (err) {
      caughtPaymentExpenseError = err;
    }
    assert.ok(caughtPaymentExpenseError instanceof NotFoundError, 'Cross-firm expense payment must throw NotFoundError');
    prisma.expense.findFirst = originalExpenseFindFirst;
  }
  console.log('✅ Passed Test 6: Cross-firm entity references strictly blocked.\n');

  // --------------------------------------------------------------------------
  // TEST 7: Multi-Company Listing Scoped by Administrative Ownership
  // --------------------------------------------------------------------------
  console.log('Test 7: Firms Listing Scoped to Authorized Companies');
  {
    const originalAuditFindMany = prisma.auditLog.findMany;
    const originalFirmFindMany = prisma.firm.findMany;

    let capturedWhereClause: any = null;

    (prisma.auditLog as any).findMany = async () => [
      { firmId: 'firm-brighton-1' },
      { firmId: 'firm-brighton-2' },
    ];

    (prisma.firm as any).findMany = async (query: any) => {
      capturedWhereClause = query.where;
      return [
        { id: 'firm-acme', name: 'Acme Consulting Ltd' },
        { id: 'firm-brighton-1', name: 'Brighton 1' },
        { id: 'firm-brighton-2', name: 'Brighton 2' },
      ];
    };

    try {
      const firms = await FirmsService.list('acme-admin-id', 'firm-acme');
      assert.strictEqual(firms.length, 3);
      assert.ok(capturedWhereClause?.id?.in, 'Query must be constrained to authorized IDs');
      assert.deepStrictEqual(
        new Set(capturedWhereClause.id.in),
        new Set(['firm-acme', 'firm-brighton-1', 'firm-brighton-2']),
        'Only primary firm and created firms must be queried'
      );
    } finally {
      prisma.auditLog.findMany = originalAuditFindMany;
      prisma.firm.findMany = originalFirmFindMany;
    }
  }
  console.log('✅ Passed Test 7: Firms list queries only authorized company IDs.\n');

  console.log('🎉 All Finora Phase 1 Multi-Company & Isolation Tests Passed Successfully!\n');
}

runTests().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
