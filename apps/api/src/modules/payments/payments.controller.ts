import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';

const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentDate: z.string().optional(),
  method: z.string().optional(),
  reference: z.string().optional(),
  provider: z.string().optional(),
});

export class PaymentsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentsService.list(req.firmId!);
      return sendSuccess(res, payments);
    } catch (error) {
      return next(error);
    }
  }

  static async record(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = recordPaymentSchema.parse(req.body);
      const payment = await PaymentsService.recordPayment(req.firmId!, validated as any);
      return sendSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) {
      return next(error);
    }
  }
}
