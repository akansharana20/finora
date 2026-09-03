import { Request, Response, NextFunction } from 'express';
import { FirmsService } from './firms.service';
import { sendSuccess } from '../../utils/response';

export class FirmsController {
  static async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const firms = await FirmsService.list();
      return sendSuccess(res, firms);
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const firm = await FirmsService.getById(req.params.id);
      return sendSuccess(res, firm);
    } catch (error) {
      return next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const firm = await FirmsService.create(req.body, req.user?.id);
      return sendSuccess(res, firm, 'Company created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const firm = await FirmsService.update(req.params.id, req.body, req.user?.id);
      return sendSuccess(res, firm, 'Company updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const firm = await FirmsService.setStatus(req.params.id, Boolean(isActive), req.user?.id);
      return sendSuccess(res, firm, `Company ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      return next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const firm = await FirmsService.getProfile(req.firmId!);
      return sendSuccess(res, firm);
    } catch (error) {
      return next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const firm = await FirmsService.updateProfile(req.firmId!, req.body, req.user?.id);
      return sendSuccess(res, firm, 'Firm details updated');
    } catch (error) {
      return next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await FirmsService.getUsers(req.firmId!);
      return sendSuccess(res, users);
    } catch (error) {
      return next(error);
    }
  }
}
