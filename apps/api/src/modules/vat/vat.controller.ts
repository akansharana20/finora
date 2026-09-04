import { Request, Response, NextFunction } from 'express';
import { VatService } from './vat.service';
import { sendSuccess } from '../../utils/response';

export class VatController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await VatService.getOverview(req.firmId!);
      return sendSuccess(res, overview);
    } catch (error) {
      return next(error);
    }
  }

  static async calculatePeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      const calc = await VatService.calculateVatPeriod(req.firmId!, { startDate, endDate });
      return sendSuccess(res, calc);
    } catch (error) {
      return next(error);
    }
  }

  static async prepareReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodKey } = req.params;
      const vatReturn = await VatService.prepareVatReturn(req.firmId!, periodKey);
      return sendSuccess(res, vatReturn, `VAT Return for period ${periodKey} prepared`);
    } catch (error) {
      return next(error);
    }
  }

  static async getReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodKey } = req.params;
      const vatReturn = await VatService.getVatReturn(req.firmId!, periodKey);
      return sendSuccess(res, vatReturn);
    } catch (error) {
      return next(error);
    }
  }

  static async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodKey } = req.params;
      const { HmrcService } = await import('../hmrc/hmrc.service');
      const result = await HmrcService.submitReturn(req.firmId!, periodKey, req);
      return sendSuccess(res, result, `VAT Return for period ${periodKey} submitted`);
    } catch (error) {
      return next(error);
    }
  }
}
