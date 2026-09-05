import { Request, Response, NextFunction } from 'express';
import { HmrcService } from './hmrc.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';

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
      const query = req.query as { code?: string; state?: string; error?: string; error_description?: string };
      const body = req.body as { code?: string; state?: string };

      const code = query.code || body?.code;
      const state = query.state || body?.state;
      const oauthError = query.error || query.error_description;

      const frontendUrl = (process.env.FRONTEND_URL || 'https://finora-web-ecru.vercel.app').replace(/\/+$/, '');

      if (oauthError) {
        if (req.accepts('html') && req.method === 'GET') {
          return res.redirect(`${frontendUrl}/integrations?hmrc_error=${encodeURIComponent(oauthError)}`);
        }
        throw new BadRequestError(`HMRC authorization was denied or failed: ${oauthError}`);
      }

      if (!code) {
        throw new BadRequestError('Missing authorization code from HMRC callback');
      }

      // Determine firmId from authenticated session or from validated state parameter
      let firmId = req.firmId;
      if (!firmId && state) {
        try {
          const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
          if (parsed && typeof parsed.firmId === 'string') {
            firmId = parsed.firmId;
          }
        } catch (e) {
          // Invalid state encoding
        }
      }

      if (!firmId) {
        if (req.accepts('html') && req.method === 'GET') {
          return res.redirect(`${frontendUrl}/integrations?hmrc_error=missing_firm_context`);
        }
        throw new BadRequestError('Unable to identify firm for HMRC connection callback');
      }

      const connection = await HmrcService.handleCallback(firmId, code);

      // If browser GET redirect directly from HMRC, redirect user back to integrations dashboard
      if (req.accepts('html') && req.method === 'GET') {
        return res.redirect(`${frontendUrl}/integrations?hmrc=connected`);
      }

      return sendSuccess(res, connection, 'Connected to HMRC successfully');
    } catch (error: any) {
      const frontendUrl = (process.env.FRONTEND_URL || 'https://finora-web-ecru.vercel.app').replace(/\/+$/, '');
      if (req.accepts('html') && req.method === 'GET') {
        return res.redirect(`${frontendUrl}/integrations?hmrc_error=${encodeURIComponent(error.message || 'connection_failed')}`);
      }
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
      const obligations = await HmrcService.syncObligations(req.firmId!, req);
      return sendSuccess(res, obligations, 'HMRC VAT obligations synchronized');
    } catch (error) {
      return next(error);
    }
  }

  static async submitReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { periodKey } = req.params;
      const result = await HmrcService.submitReturn(req.firmId!, periodKey, req);
      return sendSuccess(res, result, `VAT Return for period ${periodKey} submitted to HMRC`);
    } catch (error) {
      return next(error);
    }
  }
}
