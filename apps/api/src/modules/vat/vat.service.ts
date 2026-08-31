import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { VatReturnStatus, VatObligationStatus } from '@prisma/client';
import Decimal from 'decimal.js';

export interface CalculateVatParams {
  startDate: string | Date;
  endDate: string | Date;
}

export class VatService {
  static async getOverview(firmId: string) {
    const obligations = await prisma.vatObligation.findMany({
      where: { firmId },
      orderBy: { startPeriod: 'desc' },
    });

    const openObligation = obligations.find((o) => o.status === VatObligationStatus.OPEN) || obligations[0];

    // Current period dates
    const startDate = openObligation ? openObligation.startPeriod : new Date('2026-04-01');
    const endDate = openObligation ? openObligation.endPeriod : new Date('2026-06-30');

    // Calculate current live VAT position
    const calculation = await VatService.calculateVatPeriod(firmId, { startDate, endDate });

    // Recent VAT returns
    const returns = await prisma.vatReturn.findMany({
      where: { firmId },
      orderBy: { startPeriod: 'desc' },
    });

    const connection = await prisma.hmrcConnection.findUnique({
      where: { firmId },
    });

    return {
      currentPeriod: {
        periodKey: openObligation ? openObligation.periodKey : '26C2',
        startDate,
        endDate,
        dueDate: openObligation ? openObligation.dueDate : new Date('2026-08-07'),
        status: openObligation ? openObligation.status : VatObligationStatus.OPEN,
      },
      liveCalculation: calculation,
      obligations,
      returns,
      hmrcConnectionStatus: {
        isConnected: connection?.isConnected || false,
        vrn: connection?.vrn || null,
        environment: connection?.environment || 'sandbox',
        lastSyncAt: connection?.lastSyncAt || null,
      },
    };
  }

  static async calculateVatPeriod(firmId: string, params: CalculateVatParams) {
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);

    // Sales/Invoices in period
    const invoices = await prisma.invoice.findMany({
      where: {
        firmId,
        issueDate: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
      include: { items: true },
    });

    // Purchases/Expenses in period
    const expenses = await prisma.expense.findMany({
      where: {
        firmId,
        date: { gte: start, lte: end },
      },
    });

    // Box 1: VAT due on sales
    let box1 = new Decimal(0);
    // Box 6: Total value of sales ex VAT
    let box6 = new Decimal(0);

    for (const inv of invoices) {
      box1 = box1.plus(inv.vatTotal);
      box6 = box6.plus(inv.subtotal);
    }

    // Box 2: VAT on EC acquisitions (Default 0 for standard UK domestic V1)
    const box2 = new Decimal(0);

    // Box 3: Total VAT due (Box 1 + Box 2)
    const box3 = box1.plus(box2);

    // Box 4: VAT reclaimed on purchases
    let box4 = new Decimal(0);
    // Box 7: Total value of purchases ex VAT
    let box7 = new Decimal(0);

    for (const exp of expenses) {
      box4 = box4.plus(exp.vatAmount);
      box7 = box7.plus(exp.amount);
    }

    // Box 5: Net VAT to pay (Box 3 - Box 4)
    const box5 = box3.minus(box4);

    // Box 8 & Box 9: EC supplies/acquisitions (0 for standard domestic V1)
    const box8 = new Decimal(0);
    const box9 = new Decimal(0);

    return {
      period: { startDate: start, endDate: end },
      box1: box1.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box2: box2.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box3: box3.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box4: box4.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box5: box5.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box6: box6.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box7: box7.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box8: box8.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      box9: box9.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
      transactionCount: {
        invoices: invoices.length,
        expenses: expenses.length,
      },
    };
  }

  static async prepareVatReturn(firmId: string, periodKey: string) {
    const obligation = await prisma.vatObligation.findFirst({
      where: { firmId, periodKey },
    });

    const startPeriod = obligation ? obligation.startPeriod : new Date('2026-04-01');
    const endPeriod = obligation ? obligation.endPeriod : new Date('2026-06-30');

    const calc = await VatService.calculateVatPeriod(firmId, { startDate: startPeriod, endDate: endPeriod });

    // Save or update draft return
    const vatReturn = await prisma.vatReturn.upsert({
      where: {
        firmId_periodKey: { firmId, periodKey },
      },
      update: {
        box1: calc.box1,
        box2: calc.box2,
        box3: calc.box3,
        box4: calc.box4,
        box5: calc.box5,
        box6: calc.box6,
        box7: calc.box7,
        box8: calc.box8,
        box9: calc.box9,
        status: VatReturnStatus.DRAFT,
      },
      create: {
        firmId,
        periodKey,
        startPeriod,
        endPeriod,
        box1: calc.box1,
        box2: calc.box2,
        box3: calc.box3,
        box4: calc.box4,
        box5: calc.box5,
        box6: calc.box6,
        box7: calc.box7,
        box8: calc.box8,
        box9: calc.box9,
        status: VatReturnStatus.DRAFT,
      },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'VAT_RETURN_PREPARED',
        entity: 'VatReturn',
        entityId: vatReturn.id,
        metadata: `Prepared VAT return for period ${periodKey} (Net payable: £${vatReturn.box5.toString()})`,
      },
    });

    return vatReturn;
  }

  static async getVatReturn(firmId: string, periodKey: string) {
    const vatReturn = await prisma.vatReturn.findFirst({
      where: { firmId, periodKey },
    });

    if (!vatReturn) {
      throw new NotFoundError(`VAT Return for period ${periodKey} not found. Prepare the return first.`);
    }

    return vatReturn;
  }
}
