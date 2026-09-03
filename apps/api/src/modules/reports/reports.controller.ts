import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.getDashboard(req.firmId!);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  static async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.getRevenueReport(req.firmId!, req.query as any);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  static async getExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.getExpenseReport(req.firmId!, req.query as any);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }

  static async getVat(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportsService.getVatReport(req.firmId!, req.query as any);
      return sendSuccess(res, data);
    } catch (error) {
      return next(error);
    }
  }
}
