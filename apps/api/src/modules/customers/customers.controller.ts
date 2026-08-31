import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  vatNumber: z.string().optional(),
  notes: z.string().optional(),
});

export class CustomersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await CustomersService.list(req.firmId!, req.query as any);
      return sendSuccess(res, customers);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomersService.getById(req.firmId!, req.params.id);
      return sendSuccess(res, customer);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const customer = await CustomersService.create(req.firmId!, validated as any);
      return sendSuccess(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerSchema.partial().parse(req.body);
      const customer = await CustomersService.update(req.firmId!, req.params.id, validated as any);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (error) {
      return next(error);
    }
  }
}
