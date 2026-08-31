export interface XeroContact {
  contactId: string;
  name: string;
  emailAddress?: string;
  phones?: Array<{ phoneNumber: string }>;
  addresses?: Array<{ addressLine1: string; postalCode: string }>;
  taxNumber?: string;
}

export interface XeroInvoice {
  invoiceId: string;
  invoiceNumber: string;
  contact: { name: string };
  date: string;
  dueDate: string;
  subTotal: number;
  totalTax: number;
  total: number;
  amountDue: number;
  status: string;
}

export class XeroClient {
  private isMockMode: boolean;

  constructor() {
    this.isMockMode = process.env.INTEGRATION_MODE === 'mock' || !process.env.XERO_CLIENT_ID;
  }

  getAuthorizationUrl(state: string): string {
    if (this.isMockMode) {
      return `${process.env.XERO_REDIRECT_URI || 'http://localhost:4000/api/xero/callback'}?code=mock_xero_code&state=${state}`;
    }
    const redirectUri = encodeURIComponent(process.env.XERO_REDIRECT_URI || '');
    return `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${process.env.XERO_CLIENT_ID}&redirect_uri=${redirectUri}&scope=accounting.transactions%20accounting.contacts.read&state=${state}`;
  }

  async syncContacts(): Promise<XeroContact[]> {
    return [
      { contactId: 'xero-c1', name: 'Barclays Enterprise Advisory', emailAddress: 'accounts@barclays.co.uk', taxNumber: 'GB109876543' },
      { contactId: 'xero-c2', name: 'Vodafone Enterprise UK', emailAddress: 'billing@vodafone.co.uk', taxNumber: 'GB567890123' },
      { contactId: 'xero-c3', name: 'Manchester Science Park Ltd', emailAddress: 'finance@mspl.co.uk', taxNumber: 'GB345678901' },
      { contactId: 'xero-c4', name: 'Scottish Energy Solutions', emailAddress: 'payables@scottishenergy.scot', taxNumber: 'GB901234567' },
    ];
  }

  async syncInvoices(): Promise<XeroInvoice[]> {
    return [
      {
        invoiceId: 'xero-inv-101',
        invoiceNumber: 'XERO-INV-001',
        contact: { name: 'Barclays Enterprise Advisory' },
        date: new Date(Date.now() - 15 * 86400000).toISOString(),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        subTotal: 5000.0,
        totalTax: 1000.0,
        total: 6000.0,
        amountDue: 6000.0,
        status: 'AUTHORISED',
      },
      {
        invoiceId: 'xero-inv-102',
        invoiceNumber: 'XERO-INV-002',
        contact: { name: 'Vodafone Enterprise UK' },
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        subTotal: 3200.0,
        totalTax: 640.0,
        total: 3840.0,
        amountDue: 0.0,
        status: 'PAID',
      },
    ];
  }
}
