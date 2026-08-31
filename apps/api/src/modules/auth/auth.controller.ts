import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { z } from 'zod';

const registerSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters'),
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated as any);
      return sendSuccess(res, result, 'Firm registered successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated as any);
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await AuthService.getProfile(req.user!.id, req.firmId!);
      return sendSuccess(res, profile);
    } catch (error) {
      return next(error);
    }
  }
}
