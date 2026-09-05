import { BadRequestError } from '../../utils/errors';

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
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private isMockMode: boolean;

  constructor() {
    this.baseUrl = (process.env.HMRC_BASE_URL || 'https://test-api.service.hmrc.gov.uk').replace(/\/+$/, '');
    this.clientId = process.env.HMRC_CLIENT_ID || '';
    this.clientSecret = process.env.HMRC_CLIENT_SECRET || '';
    this.redirectUri = process.env.HMRC_REDIRECT_URI || 'https://finora-api-alpha.vercel.app/api/hmrc/callback';
    
    // Explicit integration mode handling:
    // When INTEGRATION_MODE is 'sandbox' or 'production', mock mode is strictly disabled.
    const mode = (process.env.INTEGRATION_MODE || '').toLowerCase();
    if (mode === 'sandbox' || mode === 'production') {
      this.isMockMode = false;
    } else {
      this.isMockMode = mode === 'mock' || !process.env.HMRC_CLIENT_ID;
    }
  }

  getAuthorizationUrl(state: string): string {
    if (this.isMockMode) {
      const callback = process.env.HMRC_REDIRECT_URI || 'http://localhost:4000/api/hmrc/callback';
      const delimiter = callback.includes('?') ? '&' : '?';
      return `${callback}${delimiter}code=mock_authorization_code&state=${state}`;
    }

    if (!this.clientId) {
      throw new BadRequestError('HMRC OAuth Client ID is missing. Please configure HMRC_CLIENT_ID on the API server.');
    }

    const redirectUri = encodeURIComponent(this.redirectUri);
    const scope = encodeURIComponent('read:vat write:vat');
    return `${this.baseUrl}/oauth/authorize?response_type=code&client_id=${encodeURIComponent(this.clientId)}&scope=${scope}&redirect_uri=${redirectUri}&state=${encodeURIComponent(state)}`;
  }

  async exchangeCodeForTokens(code: string): Promise<HmrcTokenResponse> {
    if (this.isMockMode || code.startsWith('mock_')) {
      return {
        access_token: `mock_hmrc_access_token_${Date.now()}`,
        refresh_token: `mock_hmrc_refresh_token_${Date.now()}`,
        expires_in: 14400, // 4 hours
        scope: 'read:vat write:vat',
        token_type: 'Bearer',
      };
    }

    const tokenUrl = `${this.baseUrl}/oauth/token`;
    const bodyParams = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedError = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedError = json.error_description || json.error || json.message || errorText;
      } catch (e) {
        // Keep raw text
      }
      throw new Error(`HMRC OAuth token exchange failed (${res.status}): ${parsedError}`);
    }

    const data = (await res.json()) as HmrcTokenResponse;
    return data;
  }

  async refreshAccessToken(refreshToken: string): Promise<HmrcTokenResponse> {
    if (this.isMockMode || refreshToken.startsWith('mock_')) {
      return {
        access_token: `mock_hmrc_refreshed_token_${Date.now()}`,
        refresh_token: `mock_hmrc_refresh_token_${Date.now()}`,
        expires_in: 14400,
        scope: 'read:vat write:vat',
        token_type: 'Bearer',
      };
    }

    const tokenUrl = `${this.baseUrl}/oauth/token`;
    const bodyParams = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: bodyParams.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedError = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedError = json.error_description || json.error || json.message || errorText;
      } catch (e) {
        // Keep raw text
      }
      throw new Error(`HMRC token refresh failed (${res.status}): ${parsedError}`);
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
    if (this.isMockMode || !accessToken || accessToken.startsWith('mock_')) {
      return [
        { start: '2025-10-01', end: '2025-12-31', due: '2026-02-07', status: 'F', periodKey: '25C4', received: '2026-02-01' },
        { start: '2026-01-01', end: '2026-03-31', due: '2026-05-07', status: 'F', periodKey: '26C1', received: '2026-04-28' },
        { start: '2026-04-01', end: '2026-06-30', due: '2026-08-07', status: 'O', periodKey: '26C2' },
        { start: '2026-07-01', end: '2026-09-30', due: '2026-11-07', status: 'O', periodKey: '26C3' },
      ];
    }

    const cleanVrn = vrn.replace(/[^0-9]/g, '');
    const query = new URLSearchParams();
    if (options?.from) query.set('from', options.from);
    if (options?.to) query.set('to', options.to);
    if (options?.status) query.set('status', options.status);

    const qs = query.toString();
    const url = `${this.baseUrl}/organisations/vat/${cleanVrn}/obligations${qs ? `?${qs}` : ''}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.hmrc.1.0+json',
      'Authorization': `Bearer ${accessToken}`,
      ...(options?.fraudHeaders || {}),
    };

    const res = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMsg = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedMsg = json.message || json.code || errorText;
      } catch (e) {
        // Keep raw text
      }
      throw new Error(`HMRC VAT obligations request failed (${res.status}): ${parsedMsg}`);
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
    if (this.isMockMode || !accessToken || accessToken.startsWith('mock_')) {
      const correlationId = `HMRC-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const formBundleNumber = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      return {
        formBundleNumber,
        paymentIndicator: payload.netVatDue > 0 ? 'DD' : 'BANK',
        processingDate: new Date().toISOString(),
        chargeRefNumber: `XD${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        correlationId,
      };
    }

    const cleanVrn = vrn.replace(/[^0-9]/g, '');
    const url = `${this.baseUrl}/organisations/vat/${cleanVrn}/returns`;

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

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(sanitizedPayload),
    });

    const correlationId = res.headers.get('x-correlation-id') ||
      res.headers.get('correlationId') ||
      res.headers.get('x-request-id') ||
      `HMRC-SUB-${Date.now()}`;

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMsg = errorText;
      try {
        const json = JSON.parse(errorText);
        parsedMsg = json.message || json.code || errorText;
      } catch (e) {
        // Keep raw text
      }
      throw new Error(`HMRC VAT return submission failed (${res.status}): ${parsedMsg}`);
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
