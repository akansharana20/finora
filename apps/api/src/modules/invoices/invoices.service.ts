import prisma from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { InvoiceStatus } from '@prisma/client';
import { calculateInvoiceTotals } from '../../utils/financial';
import Decimal from 'decimal.js';

export interface InvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate: string | Date;
  notes?: string;
  items: InvoiceItemDto[];
}

export interface InvoiceQueryDto {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
}

export class InvoicesService {
  static async list(firmId: string, query: InvoiceQueryDto) {
    const whereClause: any = { firmId };

    if (query.status) {
      whereClause.status = query.status;
    }

    if (query.customerId) {
      whereClause.customerId = query.customerId;
    }

    if (query.search) {
      whereClause.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { customer: { companyName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, companyName: true, email: true },
        },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(firmId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, firmId },
      include: {
        customer: true,
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  static async create(firmId: string, dto: CreateInvoiceDto) {
    // Verify customer belongs to firm
    const customer = await prisma.customer.findFirst({
      where: { id: dto.customerId, firmId },
    });

    if (!customer) {
      throw new BadRequestError('Customer not found or invalid');
    }

    // Check unique invoice number for firm
    const existing = await prisma.invoice.findFirst({
      where: { firmId, invoiceNumber: dto.invoiceNumber },
    });

    if (existing) {
      throw new BadRequestError(`Invoice number ${dto.invoiceNumber} already exists`);
    }

    // Server-side deterministic financial calculation
    const calc = calculateInvoiceTotals(dto.items);

    const invoice = await prisma.invoice.create({
      data: {
        firmId,
        customerId: dto.customerId,
        invoiceNumber: dto.invoiceNumber,
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.DRAFT,
        subtotal: calc.subtotal,
        vatTotal: calc.vatTotal,
        total: calc.total,
        amountPaid: new Decimal(0),
        balanceDue: calc.total,
        notes: dto.notes,
        items: {
          create: calc.calculatedItems.map((item, idx) => ({
            description: dto.items[idx].description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate,
            vatAmount: item.vatAmount,
            total: item.total,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'INVOICE_CREATED',
        entity: 'Invoice',
        entityId: invoice.id,
        metadata: `Created invoice ${invoice.invoiceNumber} for ${customer.name} totaling £${invoice.total.toString()}`,
      },
    });

    return invoice;
  }

  static async update(firmId: string, id: string, dto: Partial<CreateInvoiceDto> & { status?: InvoiceStatus }) {
    const existing = await InvoicesService.getById(firmId, id);

    let updateData: any = {};

    if (dto.status) {
      updateData.status = dto.status;
    }

    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    if (dto.dueDate) {
      updateData.dueDate = new Date(dto.dueDate);
    }

    // If updating draft line items
    if (dto.items && existing.status === InvoiceStatus.DRAFT) {
      const calc = calculateInvoiceTotals(dto.items);
      updateData.subtotal = calc.subtotal;
      updateData.vatTotal = calc.vatTotal;
      updateData.total = calc.total;
      updateData.balanceDue = calc.total.minus(existing.amountPaid);

      // Recreate line items
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

      updateData.items = {
        create: calc.calculatedItems.map((item, idx) => ({
          description: dto.items![idx].description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          vatAmount: item.vatAmount,
          total: item.total,
        })),
      };
    }

    return prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { customer: true, items: true, payments: true },
    });
  }

  static async updateStatus(firmId: string, id: string, status: InvoiceStatus) {
    await InvoicesService.getById(firmId, id);
    return prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }
}
