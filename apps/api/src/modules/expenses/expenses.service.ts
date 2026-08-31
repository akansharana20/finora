import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { ExpensePaymentStatus } from '@prisma/client';
import Decimal from 'decimal.js';

export interface CreateExpenseDto {
  supplierId?: string;
  category: string;
  description: string;
  date: string | Date;
  amount: number;
  vatRate?: number;
  paymentStatus?: ExpensePaymentStatus;
  notes?: string;
}

export class ExpensesService {
  static async list(firmId: string, query: { category?: string; supplierId?: string; search?: string }) {
    const whereClause: any = { firmId };

    if (query.category) {
      whereClause.category = query.category;
    }

    if (query.supplierId) {
      whereClause.supplierId = query.supplierId;
    }

    if (query.search) {
      whereClause.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.expense.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: { id: true, name: true, companyName: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  static async getById(firmId: string, id: string) {
    const expense = await prisma.expense.findFirst({
      where: { id, firmId },
      include: { supplier: true },
    });

    if (!expense) {
      throw new NotFoundError('Expense record not found');
    }

    return expense;
  }

  static async create(firmId: string, dto: CreateExpenseDto) {
    const amountDec = new Decimal(dto.amount);
    const vatRateDec = new Decimal(dto.vatRate !== undefined ? dto.vatRate : 20.0);
    const vatAmountDec = amountDec.times(vatRateDec).dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const totalDec = amountDec.plus(vatAmountDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const expense = await prisma.expense.create({
      data: {
        firmId,
        supplierId: dto.supplierId || null,
        category: dto.category,
        description: dto.description,
        date: new Date(dto.date),
        amount: amountDec,
        vatRate: vatRateDec,
        vatAmount: vatAmountDec,
        total: totalDec,
        paymentStatus: dto.paymentStatus || ExpensePaymentStatus.PAID,
        notes: dto.notes,
      },
      include: { supplier: true },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'EXPENSE_RECORDED',
        entity: 'Expense',
        entityId: expense.id,
        metadata: `Recorded expense ${expense.description} (£${expense.total.toString()})`,
      },
    });

    return expense;
  }

  static async delete(firmId: string, id: string) {
    await ExpensesService.getById(firmId, id);
    return prisma.expense.delete({
      where: { id },
    });
  }
}
