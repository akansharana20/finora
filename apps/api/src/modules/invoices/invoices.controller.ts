import { Request, Response, NextFunction } from 'express';
import { InvoicesService } from './invoices.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  vatRate: z.number().min(0, 'VAT rate must be non-negative'),
});

const createInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
});

export class InvoicesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await InvoicesService.list(req.firmId!, req.query as any);
      return sendSuccess(res, invoices);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoicesService.getById(req.firmId!, req.params.id);
      return sendSuccess(res, invoice);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createInvoiceSchema.parse(req.body);
      const invoice = await InvoicesService.create(req.firmId!, validated as any);
      return sendSuccess(res, invoice, 'Invoice created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoicesService.update(req.firmId!, req.params.id, req.body);
      return sendSuccess(res, invoice, 'Invoice updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body as { status: InvoiceStatus };
      const invoice = await InvoicesService.updateStatus(req.firmId!, req.params.id, status);
      return sendSuccess(res, invoice, `Invoice status updated to ${status}`);
    } catch (error) {
      return next(error);
    }
  }
}
