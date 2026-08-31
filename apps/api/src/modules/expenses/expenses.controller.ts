import { Request, Response, NextFunction } from 'express';
import { ExpensesService } from './expenses.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';

const createExpenseSchema = z.object({
  supplierId: z.string().uuid().optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string(),
  amount: z.number().positive('Amount must be positive'),
  vatRate: z.number().min(0).optional(),
  paymentStatus: z.enum(['PAID', 'UNPAID', 'PARTIAL']).optional(),
  notes: z.string().optional(),
});

export class ExpensesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await ExpensesService.list(req.firmId!, req.query as any);
      return sendSuccess(res, expenses);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await ExpensesService.getById(req.firmId!, req.params.id);
      return sendSuccess(res, expense);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createExpenseSchema.parse(req.body);
      const expense = await ExpensesService.create(req.firmId!, validated as any);
      return sendSuccess(res, expense, 'Expense recorded successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ExpensesService.delete(req.firmId!, req.params.id);
      return sendSuccess(res, null, 'Expense deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}
