import { Request, Response, NextFunction } from 'express';
import { SuppliersService } from './suppliers.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';

const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  postcode: z.string().optional(),
  vatNumber: z.string().optional(),
  notes: z.string().optional(),
});

export class SuppliersController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const suppliers = await SuppliersService.list(req.firmId!, req.query as any);
      return sendSuccess(res, suppliers);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const supplier = await SuppliersService.getById(req.firmId!, req.params.id);
      return sendSuccess(res, supplier);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSupplierSchema.parse(req.body);
      const supplier = await SuppliersService.create(req.firmId!, validated as any);
      return sendSuccess(res, supplier, 'Supplier created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createSupplierSchema.partial().parse(req.body);
      const supplier = await SuppliersService.update(req.firmId!, req.params.id, validated as any);
      return sendSuccess(res, supplier, 'Supplier updated successfully');
    } catch (error) {
      return next(error);
    }
  }
}
