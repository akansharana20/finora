import { Request, Response, NextFunction } from 'express';
import { HmrcService } from './hmrc.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';
import { getValidatedFrontendUrl } from '../../config/env';

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
    const isBrowserGet = req.method === 'GET';
    const frontendUrl = getValidatedFrontendUrl();

    try {
      const query = req.query as { code?: string; state?: string; error?: string; error_description?: string };
      const body = req.body as { code?: string; state?: string };

      const code = query.code || body?.code;
      const state = query.state || body?.state;
      const oauthError = query.error || query.error_description;

      if (oauthError) {
        if (isBrowserGet) {
          return res.redirect(`${frontendUrl}/integrations?hmrc_error=${encodeURIComponent(oauthError)}`);
        }
        throw new BadRequestError(`HMRC authorization was denied or failed: ${oauthError}`);
      }

      if (!code) {
        if (isBrowserGet) {
          return res.redirect(`${frontendUrl}/integrations?hmrc_error=missing_code`);
        }
        throw new BadRequestError('Missing authorization code from HMRC callback');
      }

      if (!state) {
        if (isBrowserGet) {
          return res.redirect(`${frontendUrl}/integrations?hmrc_error=missing_firm_context`);
        }
        throw new BadRequestError('Unable to identify firm for HMRC connection callback');
      }

      const firmId = await HmrcService.consumeOAuthState(state);
      const connection = await HmrcService.handleCallback(firmId, code);

      // Browser GET redirect from HMRC sandbox/production must always return to frontend Integrations page
      if (isBrowserGet) {
        return res.redirect(`${frontendUrl}/integrations?hmrc=connected`);
      }

      return sendSuccess(res, connection, 'Connected to HMRC successfully');
    } catch (error: any) {
      if (isBrowserGet) {
        const safeReason = error?.message ? String(error.message).slice(0, 150) : 'connection_failed';
        return res.redirect(`${frontendUrl}/integrations?hmrc_error=${encodeURIComponent(safeReason)}`);
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
