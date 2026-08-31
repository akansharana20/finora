import { Request, Response, NextFunction } from 'express';
import { HmrcService } from './hmrc.service';
import { sendSuccess } from '../../utils/response';

export class HmrcController {
  static async getConnectUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const url = await HmrcService.getConnectUrl(req.firmId!);
      return sendSuccess(res, { url });
    } catch (error) {
      return next(error);
    }
  }

  static async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query as { code: string };
      const connection = await HmrcService.handleCallback(req.firmId!, code || 'mock_code');
      return sendSuccess(res, connection, 'Connected to HMRC successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await HmrcService.getStatus(req.firmId!);
      return sendSuccess(res, status);
    } catch (error) {
      return next(error);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HmrcService.disconnect(req.firmId!);
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }

  static async syncObligations(req: Request, res: Response, next: NextFunction) {
    try {
      const obligations = await HmrcService.syncObligations(req.firmId!);
      return sendSuccess(res, obligations, 'HMRC VAT obligations synchronized');
    } catch (error) {
      return next(error);
    }
  }

  static async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodKey } = req.params;
      const result = await HmrcService.submitReturn(req.firmId!, periodKey);
      return sendSuccess(res, result, `VAT Return for period ${periodKey} submitted to HMRC`);
    } catch (error) {
      return next(error);
    }
  }
}
