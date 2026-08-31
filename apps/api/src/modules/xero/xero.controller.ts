import { Request, Response, NextFunction } from 'express';
import { XeroService } from './xero.service';
import { sendSuccess } from '../../utils/response';

export class XeroController {
  static async getConnectUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const url = await XeroService.getConnectUrl(req.firmId!);
      return sendSuccess(res, { url });
    } catch (error) {
      return next(error);
    }
  }

  static async handleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query as { code: string };
      const connection = await XeroService.handleCallback(req.firmId!, code || 'mock_code');
      return sendSuccess(res, connection, 'Connected to Xero successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await XeroService.getStatus(req.firmId!);
      return sendSuccess(res, status);
    } catch (error) {
      return next(error);
    }
  }

  static async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await XeroService.disconnect(req.firmId!);
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  }

  static async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await XeroService.sync(req.firmId!);
      return sendSuccess(res, result, 'Xero synchronization completed');
    } catch (error) {
      return next(error);
    }
  }
}
