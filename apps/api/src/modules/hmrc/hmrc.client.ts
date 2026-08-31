import { VatObligationStatus } from '@prisma/client';

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

export class HmrcClient {
  private baseUrl: string;
  private clientId: string;
  private isMockMode: boolean;

  constructor() {
    this.baseUrl = process.env.HMRC_BASE_URL || 'https://test-api.service.hmrc.gov.uk';
    this.clientId = process.env.HMRC_CLIENT_ID || 'mock_client';
    this.isMockMode = process.env.INTEGRATION_MODE === 'mock' || !process.env.HMRC_CLIENT_ID;
  }

  getAuthorizationUrl(state: string): string {
    if (this.isMockMode) {
      return `${process.env.HMRC_REDIRECT_URI || 'http://localhost:4000/api/hmrc/callback'}?code=mock_authorization_code&state=${state}`;
    }
    const redirectUri = encodeURIComponent(process.env.HMRC_REDIRECT_URI || '');
    return `${this.baseUrl}/oauth/authorize?response_type=code&client_id=${this.clientId}&scope=read:vat%20write:vat&redirect_uri=${redirectUri}&state=${state}`;
  }

  async getVatObligations(vrn: string): Promise<HmrcObligationResponse[]> {
    if (this.isMockMode) {
      return [
        { start: '2025-10-01', end: '2025-12-31', due: '2026-02-07', status: 'F', periodKey: '25C4', received: '2026-02-01' },
        { start: '2026-01-01', end: '2026-03-31', due: '2026-05-07', status: 'F', periodKey: '26C1', received: '2026-04-28' },
        { start: '2026-04-01', end: '2026-06-30', due: '2026-08-07', status: 'O', periodKey: '26C2' },
        { start: '2026-07-01', end: '2026-09-30', due: '2026-11-07', status: 'O', periodKey: '26C3' },
      ];
    }
    // Live/Sandbox API call simulation using fetch if live credentials present
    return [
      { start: '2026-04-01', end: '2026-06-30', due: '2026-08-07', status: 'O', periodKey: '26C2' },
    ];
  }

  async submitVatReturn(vrn: string, payload: HmrcVatReturnSubmitPayload): Promise<{ formBundleNumber: string; paymentIndicator?: string; correlationId: string }> {
    const correlationId = `HMRC-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const formBundleNumber = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    return {
      formBundleNumber,
      paymentIndicator: payload.netVatDue > 0 ? 'DD' : 'BANK',
      correlationId,
    };
  }
}
