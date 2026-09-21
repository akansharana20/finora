import { BadRequestError } from '../../utils/errors';
import { HmrcApiError } from './hmrc.error';

export interface HmrcObligationResponse {
  start: string;
  end: string;
  due: string;
  status: 'O' | 'F';
  periodKey: string;
  received?: string;
}

export interface HmrcVatReturnSubmitPayload {
  periodKey: string;
  vatDueSales: number;
  vatDueAcquisitions: number;
  totalVatDue: number;
  vatReclaimedCurrPeriod: number;
  netVatDue: number;
  totalValueSalesExVAT: number;
  totalValuePurchasesExVAT: number;
  totalValueGoodsSuppliedExVAT: number;
  totalAcquisitionsExVAT: number;
  finalised: boolean;
}

export interface HmrcTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

export interface HmrcSubmissionReceipt {
  formBundleNumber: string;
  paymentIndicator?: string;
  processingDate?: string;
  chargeRefNumber?: string;
  correlationId: string;
}

export class HmrcClient {
  private getConfig() {
    const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');
    return {
      baseUrl: trimTrailingSlashes((process.env.HMRC_BASE_URL || '').trim()),
      authBaseUrl: trimTrailingSlashes((process.env.HMRC_AUTH_BASE_URL || '').trim()),
      clientId: (process.env.HMRC_CLIENT_ID || '').trim(),
      clientSecret: (process.env.HMRC_CLIENT_SECRET || '').trim(),
      redirectUri: (process.env.HMRC_REDIRECT_URI || '').trim(),
    };
  }

  getAuthorizationUrl(state: string): string {
    const config = this.getConfig();
    if (!config.clientId || !config.redirectUri || !config.authBaseUrl) {
      throw new BadRequestError('HMRC OAuth is not fully configured. Set HMRC_CLIENT_ID, HMRC_REDIRECT_URI, and HMRC_AUTH_BASE_URL on the API server.');
    }

    const redirectUri = encodeURIComponent(config.redirectUri);
    const scope = encodeURIComponent('read:vat write:vat');
    return `${config.authBaseUrl}/oauth/authorize?response_type=code&client_id=${encodeURIComponent(config.clientId)}&scope=${scope}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;
  }

  async exchangeCodeForTokens(code: string): Promise<HmrcTokenResponse> {
    const config = this.getConfig();
    if (!config.clientId || !config.clientSecret || !config.redirectUri || !config.baseUrl) {
      throw new BadRequestError('HMRC token exchange is not fully configured on the API server.');
    }
    const tokenUrl = `${config.baseUrl}/oauth/token`;
    const bodyParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code,
    });

    let res: Response;
    try {
      res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: bodyParams.toString(),
      });
    } catch (networkErr: any) {
      throw HmrcApiError.networkError('exchangeCodeForTokens', networkErr);
    }

    if (!res.ok) {
      const errorText = await res.text();
      const correlationId = res.headers.get('x-correlation-id') || res.headers.get('correlationId') || undefined;
      throw HmrcApiError.fromHmrcResponse(res.status, errorText, 'exchangeCodeForTokens', correlationId);
    }

    const data = (await res.json()) as HmrcTokenResponse;
    return data;
  }

  async refreshAccessToken(refreshToken: string): Promise<HmrcTokenResponse> {
    const config = this.getConfig();
    if (!config.clientId || !config.clientSecret || !config.baseUrl) {
      throw new BadRequestError('HMRC token refresh is not fully configured on the API server.');
    }
    const tokenUrl = `${config.baseUrl}/oauth/token`;
    const bodyParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    let res: Response;
    try {
      res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: bodyParams.toString(),
      });
    } catch (networkErr: any) {
      throw HmrcApiError.networkError('refreshAccessToken', networkErr);
    }

    if (!res.ok) {
      const errorText = await res.text();
      const correlationId = res.headers.get('x-correlation-id') || res.headers.get('correlationId') || undefined;
      throw HmrcApiError.fromHmrcResponse(res.status, errorText, 'refreshAccessToken', correlationId);
    }

    const data = (await res.json()) as HmrcTokenResponse;
    return data;
  }

  async getVatObligations(
    vrn: string,
    accessToken?: string,
    options?: {
      from?: string;
      to?: string;
      status?: 'O' | 'F';
      fraudHeaders?: Record<string, string>;
    }
  ): Promise<HmrcObligationResponse[]> {
    const config = this.getConfig();
    if (!config.baseUrl) {
      throw new BadRequestError('HMRC API base URL is not configured on the API server.');
    }
    if (!accessToken) {
      throw new HmrcApiError({
        message: 'HMRC authorization has expired. Please reconnect this company to HMRC.',
        statusCode: 401,
        operation: 'getVatObligations',
      });
    }

    const cleanVrn = vrn.replace(/[^0-9]/g, '');
    const query = new URLSearchParams();
    if (options?.from) query.set('from', options.from);
    if (options?.to) query.set('to', options.to);
    if (options?.status) query.set('status', options.status);

    const qs = query.toString();
    const url = `${config.baseUrl}/organisations/vat/${cleanVrn}/obligations${qs ? `?${qs}` : ''}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.hmrc.1.0+json',
      'Authorization': `Bearer ${accessToken}`,
      ...(options?.fraudHeaders || {}),
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'GET',
        headers,
      });
    } catch (networkErr: any) {
      throw HmrcApiError.networkError('getVatObligations', networkErr);
    }

    const correlationId = res.headers.get('x-correlation-id') ||
      res.headers.get('correlationId') ||
      res.headers.get('x-request-id') || undefined;

    if (!res.ok) {
      const errorText = await res.text();
      throw HmrcApiError.fromHmrcResponse(res.status, errorText, 'getVatObligations', correlationId);
    }

    const data = await res.json() as { obligations?: HmrcObligationResponse[] };
    return data.obligations || [];
  }

  async submitVatReturn(
    vrn: string,
    payload: HmrcVatReturnSubmitPayload,
    accessToken?: string,
    fraudHeaders?: Record<string, string>
  ): Promise<HmrcSubmissionReceipt> {
    const config = this.getConfig();
    if (!config.baseUrl) {
      throw new BadRequestError('HMRC API base URL is not configured on the API server.');
    }
    if (!accessToken) {
      throw new HmrcApiError({
        message: 'HMRC authorization has expired. Please reconnect this company to HMRC.',
        statusCode: 401,
        operation: 'submitVatReturn',
      });
    }

    const cleanVrn = vrn.replace(/[^0-9]/g, '');
    const url = `${config.baseUrl}/organisations/vat/${cleanVrn}/returns`;

    // Ensure integers for boxes 6, 7, 8, 9 as required by HMRC specification
    const sanitizedPayload = {
      periodKey: payload.periodKey,
      vatDueSales: Number(payload.vatDueSales.toFixed(2)),
      vatDueAcquisitions: Number(payload.vatDueAcquisitions.toFixed(2)),
      totalVatDue: Number(payload.totalVatDue.toFixed(2)),
      vatReclaimedCurrPeriod: Number(payload.vatReclaimedCurrPeriod.toFixed(2)),
      netVatDue: Number(payload.netVatDue.toFixed(2)),
      totalValueSalesExVAT: Math.trunc(payload.totalValueSalesExVAT),
      totalValuePurchasesExVAT: Math.trunc(payload.totalValuePurchasesExVAT),
      totalValueGoodsSuppliedExVAT: Math.trunc(payload.totalValueGoodsSuppliedExVAT),
      totalAcquisitionsExVAT: Math.trunc(payload.totalAcquisitionsExVAT),
      finalised: true,
    };

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.hmrc.1.0+json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...(fraudHeaders || {}),
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(sanitizedPayload),
      });
    } catch (networkErr: any) {
      throw HmrcApiError.networkError('submitVatReturn', networkErr);
    }

    const correlationId = res.headers.get('x-correlation-id') ||
      res.headers.get('correlationId') ||
      res.headers.get('x-request-id') ||
      `HMRC-SUB-${Date.now()}`;

    if (!res.ok) {
      const errorText = await res.text();
      throw HmrcApiError.fromHmrcResponse(res.status, errorText, 'submitVatReturn', correlationId);
    }

    const result = (await res.json()) as {
      formBundleNumber?: string;
      paymentIndicator?: string;
      processingDate?: string;
      chargeRefNumber?: string;
    };

    return {
      formBundleNumber: result.formBundleNumber || `${Date.now()}`,
      paymentIndicator: result.paymentIndicator || (payload.netVatDue > 0 ? 'DD' : 'BANK'),
      processingDate: result.processingDate || new Date().toISOString(),
      chargeRefNumber: result.chargeRefNumber,
      correlationId,
    };
  }
}
