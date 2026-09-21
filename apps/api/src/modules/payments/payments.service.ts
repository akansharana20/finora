import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { PaymentStatus, InvoiceStatus } from '@prisma/client';
import Decimal from 'decimal.js';

export interface RecordPaymentDto {
  invoiceId?: string;
  expenseId?: string;
  amount: number;
  paymentDate?: string | Date;
  method?: string;
  reference?: string;
  provider?: string;
}

export class PaymentsService {
  static async list(firmId: string) {
    return prisma.payment.findMany({
      where: { firmId },
      include: {
        invoice: {
          select: { id: true, invoiceNumber: true, customer: { select: { name: true } } },
        },
        expense: {
          select: { id: true, description: true, category: true },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  static async recordPayment(firmId: string, dto: RecordPaymentDto) {
    const amountDec = new Decimal(dto.amount);
    if (amountDec.lessThanOrEqualTo(0)) {
      throw new BadRequestError('Payment amount must be greater than zero');
    }

    let invoice = null;

    if (dto.invoiceId) {
      invoice = await prisma.invoice.findFirst({
        where: { id: dto.invoiceId, firmId },
      });

      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new BadRequestError('Cannot record payment for a cancelled invoice');
      }
    }

    if (dto.expenseId) {
      const expense = await prisma.expense.findFirst({
        where: { id: dto.expenseId, firmId },
      });

      if (!expense) {
        throw new NotFoundError('Expense not found or does not belong to this company');
      }
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          firmId,
          invoiceId: dto.invoiceId || null,
          expenseId: dto.expenseId || null,
          amount: amountDec,
          currency: 'GBP',
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          method: dto.method || 'BANK_TRANSFER',
          reference: dto.reference || `REF-${Date.now()}`,
          status: PaymentStatus.SUCCEEDED,
          provider: dto.provider || 'MANUAL',
        },
        include: { invoice: true },
      });

      // Update invoice financial balances and status
      if (invoice) {
        const newAmountPaid = new Decimal(invoice.amountPaid).plus(amountDec);
        const newBalanceDue = new Decimal(invoice.total).minus(newAmountPaid);

        let newStatus: InvoiceStatus = invoice.status;
        if (newBalanceDue.lessThanOrEqualTo(0)) {
          newStatus = InvoiceStatus.PAID;
        } else if (newAmountPaid.greaterThan(0)) {
          newStatus = InvoiceStatus.PARTIALLY_PAID;
        }

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newAmountPaid.toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
            balanceDue: Decimal.max(0, newBalanceDue).toDecimalPlaces(2, Decimal.ROUND_HALF_UP),
            status: newStatus,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          firmId,
          action: 'PAYMENT_RECORDED',
          entity: 'Payment',
          entityId: payment.id,
          metadata: `Recorded payment of £${amountDec.toString()} (Ref: ${payment.reference})`,
        },
      });

      return payment;
    });
  }
}
