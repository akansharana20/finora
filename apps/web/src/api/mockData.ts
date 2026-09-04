export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'USER';
  firmId: string;
  firmName: string;
  firm: {
    id: string;
    name: string;
    companyNumber: string;
    vatNumber: string;
  };
  demo: boolean;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'admin@acme.co.uk': {
    id: 'demo-user-admin',
    email: 'admin@acme.co.uk',
    name: 'Eleanor Vance (Admin)',
    role: 'ADMIN',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '08123456',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'accountant@acme.co.uk': {
    id: 'demo-user-accountant',
    email: 'accountant@acme.co.uk',
    name: 'David Croft (Accountant)',
    role: 'ACCOUNTANT',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '08123456',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'user@acme.co.uk': {
    id: 'demo-user-staff',
    email: 'user@acme.co.uk',
    name: 'Sarah Connor (Staff)',
    role: 'USER',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '08123456',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'staff@acme.co.uk': {
    id: 'demo-user-staff-2',
    email: 'staff@acme.co.uk',
    name: 'Emma Watson (Staff)',
    role: 'USER',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '08123456',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
};

const STORAGE_KEY = 'finora_demo_db_v2';

function getDefaultStore() {
  return {
    firms: [
      {
        id: 'demo-firm-acme',
        name: 'Acme Consulting Ltd',
        legalName: 'Acme Consulting Ltd',
        companyNumber: '08123456',
        vatNumber: 'GB987654321',
        address: '100 Bishopsgate, City of London',
        city: 'London',
        county: 'Greater London',
        postcode: 'EC2N 4AG',
        country: 'GB',
        currency: 'GBP',
        contactEmail: 'finance@acme.co.uk',
        contactPhone: '020 7946 0000',
        vatScheme: 'STANDARD',
        vatRegistered: true,
        financialYearStart: 4,
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'demo-firm-apex',
        name: 'Apex Digital Solutions Ltd',
        legalName: 'Apex Digital Solutions Ltd',
        companyNumber: '11987654',
        vatNumber: 'GB123456789',
        address: '12 Northern Quarter',
        city: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M4 1AL',
        country: 'GB',
        currency: 'GBP',
        contactEmail: 'accounts@apexdigital.co.uk',
        contactPhone: '0161 496 0500',
        vatScheme: 'STANDARD',
        vatRegistered: true,
        financialYearStart: 4,
        isActive: true,
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ],
    customers: [
      {
        id: 'cust-1',
        firmId: 'demo-firm-acme',
        name: 'TechNorth Solutions Ltd',
        companyName: 'TechNorth Solutions Ltd',
        email: 'billing@technorth.co.uk',
        phone: '0161 496 0123',
        address: '45 Deansgate',
        postcode: 'M3 2AY',
        vatNumber: 'GB123456789',
        notes: 'VIP software development client',
        outstandingBalance: 3600.0,
      },
      {
        id: 'cust-2',
        firmId: 'demo-firm-acme',
        name: 'Apex Retail Group',
        companyName: 'Apex Retail Group Ltd',
        email: 'finance@apexretail.co.uk',
        phone: '020 7946 0912',
        address: '120 Oxford Street',
        postcode: 'W1D 1LT',
        vatNumber: 'GB234567890',
        notes: 'Retail consulting retainer',
        outstandingBalance: 0.0,
      },
      {
        id: 'cust-3',
        firmId: 'demo-firm-acme',
        name: 'Thames Logistics Ltd',
        companyName: 'Thames Logistics Services',
        email: 'accounts@thameslogistics.co.uk',
        phone: '0118 496 0888',
        address: 'Wharfside Way',
        postcode: 'RG1 3BD',
        vatNumber: 'GB345678901',
        notes: 'Monthly management services',
        outstandingBalance: 1440.0,
      },
      {
        id: 'cust-4',
        firmId: 'demo-firm-acme',
        name: 'Highfield Media Ltd',
        companyName: 'Highfield Media Group',
        email: 'accounts@highfield.co.uk',
        phone: '0113 496 0555',
        address: '8 Park Row',
        postcode: 'LS1 5HD',
        vatNumber: 'GB456789012',
        notes: 'Digital strategy client',
        outstandingBalance: 0.0,
      },
      {
        id: 'cust-apex-1',
        firmId: 'demo-firm-apex',
        name: 'Manchester Creative Works',
        companyName: 'Manchester Creative Works Ltd',
        email: 'contact@mcworks.co.uk',
        phone: '0161 888 1234',
        address: '88 Canal Street',
        postcode: 'M1 3EZ',
        vatNumber: 'GB554433221',
        notes: 'Branding client',
        outstandingBalance: 2400.0,
      },
    ],
    suppliers: [
      {
        id: 'supp-1',
        firmId: 'demo-firm-acme',
        name: 'CloudHost UK Ltd',
        companyName: 'CloudHost UK Services Ltd',
        email: 'billing@cloudhost.co.uk',
        phone: '0800 123 4567',
        address: '2 Enterprise Way',
        postcode: 'B1 1AA',
        vatNumber: 'GB998877665',
        notes: 'Primary cloud infrastructure vendor',
        totalExpenses: 1440.0,
      },
      {
        id: 'supp-2',
        firmId: 'demo-firm-acme',
        name: 'Premier Office Supplies Ltd',
        companyName: 'Premier Office Supplies Ltd',
        email: 'orders@premieroffice.co.uk',
        phone: '0121 496 0222',
        address: 'Station Road Industrial Park',
        postcode: 'B2 4RT',
        vatNumber: 'GB887766554',
        notes: 'Office furniture & supplies',
        totalExpenses: 520.0,
      },
      {
        id: 'supp-3',
        firmId: 'demo-firm-acme',
        name: 'City Legal & Advisory LLP',
        companyName: 'City Legal & Advisory LLP',
        email: 'billing@citylegal.co.uk',
        phone: '020 7946 0888',
        address: '1 Chancery Lane',
        postcode: 'WC2A 1AL',
        vatNumber: 'GB776655443',
        notes: 'Legal & audit advisors',
        totalExpenses: 3600.0,
      },
      {
        id: 'supp-apex-1',
        firmId: 'demo-firm-apex',
        name: 'Northern Telecoms Group',
        companyName: 'Northern Telecoms Ltd',
        email: 'support@northerntel.co.uk',
        phone: '0161 777 9999',
        address: '50 Oxford Road',
        postcode: 'M1 5QA',
        vatNumber: 'GB332211009',
        notes: 'Fibre broadband & VOIP provider',
        totalExpenses: 600.0,
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        firmId: 'demo-firm-acme',
        invoiceNumber: 'INV-2026-101',
        customerId: 'cust-1',
        customerName: 'TechNorth Solutions Ltd',
        customer: {
          id: 'cust-1',
          name: 'TechNorth Solutions Ltd',
          companyName: 'TechNorth Solutions Ltd',
          address: '45 Deansgate',
          postcode: 'M3 2AY',
          vatNumber: 'GB123456789',
        },
        status: 'OVERDUE',
        issueDate: '2026-08-01',
        dueDate: '2026-08-15',
        subtotal: 3000.0,
        vatTotal: 600.0,
        total: 3600.0,
        amountPaid: 0.0,
        balanceDue: 3600.0,
        notes: 'Net 14 days payment terms. Late payments subject to statutory interest.',
        items: [
          {
            id: 'item-1',
            description: 'Enterprise Software Development Sprint 1',
            quantity: 1,
            unitPrice: 3000.0,
            vatRate: 20,
            subtotal: 3000.0,
            vatAmount: 600.0,
            total: 3600.0,
          },
        ],
        payments: [],
      },
      {
        id: 'inv-2',
        firmId: 'demo-firm-acme',
        invoiceNumber: 'INV-2026-102',
        customerId: 'cust-2',
        customerName: 'Apex Retail Group',
        customer: {
          id: 'cust-2',
          name: 'Apex Retail Group',
          companyName: 'Apex Retail Group Ltd',
          address: '120 Oxford Street',
          postcode: 'W1D 1LT',
          vatNumber: 'GB234567890',
        },
        status: 'PAID',
        issueDate: '2026-07-15',
        dueDate: '2026-08-15',
        subtotal: 5000.0,
        vatTotal: 1000.0,
        total: 6000.0,
        amountPaid: 6000.0,
        balanceDue: 0.0,
        notes: 'Paid in full via BACS.',
        items: [
          {
            id: 'item-2',
            description: 'E-commerce Platform Architecture Audit',
            quantity: 1,
            unitPrice: 5000.0,
            vatRate: 20,
            subtotal: 5000.0,
            vatAmount: 1000.0,
            total: 6000.0,
          },
        ],
        payments: [
          {
            id: 'pmt-1',
            invoiceId: 'inv-2',
            invoiceNumber: 'INV-2026-102',
            customerName: 'Apex Retail Group',
            amount: 6000.0,
            paymentDate: '2026-08-02',
            method: 'BANK_TRANSFER',
            reference: 'TRX-INV-2026-102',
            status: 'CONFIRMED',
          },
        ],
      },
      {
        id: 'inv-3',
        firmId: 'demo-firm-acme',
        invoiceNumber: 'INV-2026-103',
        customerId: 'cust-3',
        customerName: 'Thames Logistics Ltd',
        customer: {
          id: 'cust-3',
          name: 'Thames Logistics Ltd',
          companyName: 'Thames Logistics Services',
          address: 'Wharfside Way',
          postcode: 'RG1 3BD',
          vatNumber: 'GB345678901',
        },
        status: 'SENT',
        issueDate: '2026-08-20',
        dueDate: '2026-09-19',
        subtotal: 1200.0,
        vatTotal: 240.0,
        total: 1440.0,
        amountPaid: 0.0,
        balanceDue: 1440.0,
        notes: 'Monthly Cloud Infrastructure Management.',
        items: [
          {
            id: 'item-3',
            description: 'Monthly Cloud Infrastructure Management',
            quantity: 1,
            unitPrice: 1200.0,
            vatRate: 20,
            subtotal: 1200.0,
            vatAmount: 240.0,
            total: 1440.0,
          },
        ],
        payments: [],
      },
      {
        id: 'inv-4',
        firmId: 'demo-firm-acme',
        invoiceNumber: 'INV-2026-104',
        customerId: 'cust-4',
        customerName: 'Highfield Media Ltd',
        customer: {
          id: 'cust-4',
          name: 'Highfield Media Ltd',
          companyName: 'Highfield Media Group',
          address: '8 Park Row',
          postcode: 'LS1 5HD',
          vatNumber: 'GB456789012',
        },
        status: 'PAID',
        issueDate: '2026-06-10',
        dueDate: '2026-07-10',
        subtotal: 2500.0,
        vatTotal: 500.0,
        total: 3000.0,
        amountPaid: 3000.0,
        balanceDue: 0.0,
        notes: 'SEO & Performance Strategy Review.',
        items: [
          {
            id: 'item-4',
            description: 'SEO & Performance Strategy Review',
            quantity: 1,
            unitPrice: 2500.0,
            vatRate: 20,
            subtotal: 2500.0,
            vatAmount: 500.0,
            total: 3000.0,
          },
        ],
        payments: [
          {
            id: 'pmt-2',
            invoiceId: 'inv-4',
            invoiceNumber: 'INV-2026-104',
            customerName: 'Highfield Media Ltd',
            amount: 3000.0,
            paymentDate: '2026-07-08',
            method: 'BANK_TRANSFER',
            reference: 'TRX-INV-2026-104',
            status: 'CONFIRMED',
          },
        ],
      },
      {
        id: 'inv-apex-1',
        firmId: 'demo-firm-apex',
        invoiceNumber: 'APX-2026-001',
        customerId: 'cust-apex-1',
        customerName: 'Manchester Creative Works',
        customer: {
          id: 'cust-apex-1',
          name: 'Manchester Creative Works',
          companyName: 'Manchester Creative Works Ltd',
          address: '88 Canal Street',
          postcode: 'M1 3EZ',
          vatNumber: 'GB554433221',
        },
        status: 'SENT',
        issueDate: '2026-08-10',
        dueDate: '2026-09-10',
        subtotal: 2000.0,
        vatTotal: 400.0,
        total: 2400.0,
        amountPaid: 0.0,
        balanceDue: 2400.0,
        notes: 'Digital Brand Transformation.',
        items: [
          {
            id: 'item-apx-1',
            description: 'Brand Identity Design',
            quantity: 1,
            unitPrice: 2000.0,
            vatRate: 20,
            subtotal: 2000.0,
            vatAmount: 400.0,
            total: 2400.0,
          },
        ],
        payments: [],
      },
    ],
    expenses: [
      {
        id: 'exp-1',
        firmId: 'demo-firm-acme',
        expenseNumber: 'EXP-2026-01',
        supplierId: 'supp-1',
        supplierName: 'CloudHost UK Ltd',
        category: 'IT Infrastructure',
        description: 'AWS & UK Cloud Server Hosting',
        date: '2026-08-10',
        amount: 1200.0,
        vatRate: 20,
        vatAmount: 240.0,
        total: 1440.0,
        paymentStatus: 'PAID',
      },
      {
        id: 'exp-2',
        firmId: 'demo-firm-acme',
        expenseNumber: 'EXP-2026-02',
        supplierId: 'supp-2',
        supplierName: 'Premier Office Supplies Ltd',
        category: 'Office Expenses',
        description: 'Ergonomic Chairs & Desk Setup',
        date: '2026-08-14',
        amount: 433.33,
        vatRate: 20,
        vatAmount: 86.67,
        total: 520.0,
        paymentStatus: 'PAID',
      },
      {
        id: 'exp-3',
        firmId: 'demo-firm-acme',
        expenseNumber: 'EXP-2026-03',
        supplierId: 'supp-3',
        supplierName: 'City Legal & Advisory LLP',
        category: 'Professional Fees',
        description: 'Annual Compliance Audit & Legal Advisory',
        date: '2026-08-05',
        amount: 3000.0,
        vatRate: 20,
        vatAmount: 600.0,
        total: 3600.0,
        paymentStatus: 'PAID',
      },
      {
        id: 'exp-apex-1',
        firmId: 'demo-firm-apex',
        expenseNumber: 'APX-EXP-01',
        supplierId: 'supp-apex-1',
        supplierName: 'Northern Telecoms Group',
        category: 'Utilities',
        description: 'Fibre Internet & Telephone Service',
        date: '2026-08-01',
        amount: 500.0,
        vatRate: 20,
        vatAmount: 100.0,
        total: 600.0,
        paymentStatus: 'PAID',
      },
    ],
    payments: [
      {
        id: 'pmt-1',
        firmId: 'demo-firm-acme',
        invoiceId: 'inv-2',
        invoiceNumber: 'INV-2026-102',
        customerName: 'Apex Retail Group',
        amount: 6000.0,
        paymentDate: '2026-08-02',
        method: 'BANK_TRANSFER',
        reference: 'TRX-INV-2026-102',
        status: 'CONFIRMED',
      },
      {
        id: 'pmt-2',
        firmId: 'demo-firm-acme',
        invoiceId: 'inv-4',
        invoiceNumber: 'INV-2026-104',
        customerName: 'Highfield Media Ltd',
        amount: 3000.0,
        paymentDate: '2026-07-08',
        method: 'BANK_TRANSFER',
        reference: 'TRX-INV-2026-104',
        status: 'CONFIRMED',
      },
    ],
    integrations: {
      hmrc: {
        connected: true,
        vrn: '987654321',
        expiresAt: '2027-08-30T00:00:00.000Z',
      },
      xero: {
        connected: true,
        tenantName: 'Acme Consulting Ltd',
        lastSync: new Date().toISOString(),
      },
    },
    auditLogs: [
      {
        id: 'audit-1',
        firmId: 'demo-firm-acme',
        action: 'INVOICE_CREATED',
        description: 'Created invoice INV-2026-103 for Thames Logistics Ltd (£1,440.00)',
        user: 'Eleanor Vance',
        createdAt: '2026-08-20T10:15:00.000Z',
        timestamp: '2026-08-20T10:15:00.000Z',
      },
      {
        id: 'audit-2',
        firmId: 'demo-firm-acme',
        action: 'PAYMENT_RECORDED',
        description: 'Recorded £6,000.00 BACS payment for INV-2026-102',
        user: 'David Croft',
        createdAt: '2026-08-02T14:30:00.000Z',
        timestamp: '2026-08-02T14:30:00.000Z',
      },
      {
        id: 'audit-3',
        firmId: 'demo-firm-acme',
        action: 'EXPENSE_APPROVED',
        description: 'Approved expense EXP-2026-01 for CloudHost UK Ltd (£1,440.00)',
        user: 'Emma Watson',
        createdAt: '2026-08-10T11:00:00.000Z',
        timestamp: '2026-08-10T11:00:00.000Z',
      },
      {
        id: 'audit-4',
        firmId: 'demo-firm-acme',
        action: 'HMRC_MTD_VERIFIED',
        description: 'HMRC Making Tax Digital OAuth 2.0 connection token refreshed',
        user: 'Eleanor Vance',
        createdAt: '2026-08-01T09:00:00.000Z',
        timestamp: '2026-08-01T09:00:00.000Z',
      },
    ],
    vatReturns: {} as Record<string, any>,
  };
}

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse demo DB from localStorage', e);
  }
  const initial = getDefaultStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('Failed to save demo DB to localStorage', e);
  }
}

export function handleMockApi(
  endpoint: string,
  options: RequestInit = {}
): { success: boolean; data?: any; message?: string; error?: any } {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(endpoint, 'http://localhost');
  const path = url.pathname;
  const store = getStore();

  // Resolve Active Company Scope from header or localStorage
  const headerFirmId = (options.headers as any)?.['x-firm-id'];
  const currentFirmId = headerFirmId || localStorage.getItem('finora_active_firm_id') || 'demo-firm-acme';

  // Find current firm object
  let currentFirm = (store.firms || []).find((f: any) => f.id === currentFirmId);
  if (!currentFirm) {
    currentFirm = store.firms?.[0] || getDefaultStore().firms[0];
  }

  let body: any = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch (e) {
      body = {};
    }
  }

  // Auth me
  if (path === '/auth/me') {
    const savedUser = localStorage.getItem('finora_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return {
        success: true,
        data: {
          ...parsed,
          firmId: currentFirm.id,
          firmName: currentFirm.name,
          firm: currentFirm,
        },
      };
    }
    return { success: true, data: { ...DEMO_USERS['admin@acme.co.uk'], firmId: currentFirm.id, firmName: currentFirm.name, firm: currentFirm } };
  }

  // Auth login
  if (path === '/auth/login') {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    const user = DEMO_USERS[email];
    if (user && password === 'Password123!') {
      return {
        success: true,
        data: {
          user: {
            ...user,
            firmId: currentFirm.id,
            firmName: currentFirm.name,
            firm: currentFirm,
          },
          token: `demo-jwt-token-${user.role.toLowerCase()}`,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Invalid credentials. For demo mode, please use password: Password123!',
      },
    };
  }

  // ==========================================
  // COMPANY MANAGEMENT (Firms)
  // ==========================================
  if (path === '/firms' || path === '/firms/') {
    if (method === 'GET') {
      const enrichedFirms = (store.firms || []).map((f: any) => {
        const invCount = store.invoices.filter((i: any) => (i.firmId || 'demo-firm-acme') === f.id).length;
        const expCount = store.expenses.filter((e: any) => (e.firmId || 'demo-firm-acme') === f.id).length;
        const custCount = store.customers.filter((c: any) => (c.firmId || 'demo-firm-acme') === f.id).length;
        return {
          ...f,
          _count: {
            invoices: invCount,
            expenses: expCount,
            customers: custCount,
            users: f.id === 'demo-firm-acme' ? 3 : 1,
          },
        };
      });
      return { success: true, data: enrichedFirms };
    }

    if (method === 'POST') {
      const newFirm = {
        id: `firm-${Date.now()}`,
        name: body.name || 'New Company Ltd',
        legalName: body.legalName || body.name || 'New Company Ltd',
        companyNumber: body.companyNumber || '',
        vatNumber: body.vatNumber || '',
        address: body.address || '',
        city: body.city || '',
        county: body.county || '',
        postcode: body.postcode || '',
        country: body.country || 'GB',
        currency: body.currency || 'GBP',
        contactEmail: body.contactEmail || '',
        contactPhone: body.contactPhone || '',
        vatScheme: body.vatScheme || 'STANDARD',
        vatRegistered: body.vatRegistered !== undefined ? body.vatRegistered : true,
        financialYearStart: body.financialYearStart || 4,
        isActive: body.isActive !== undefined ? body.isActive : true,
        createdAt: new Date().toISOString(),
      };

      store.firms.unshift(newFirm);

      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        firmId: newFirm.id,
        action: 'FIRM_CREATED',
        description: `Created new company: ${newFirm.name}`,
        user: 'Admin',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newFirm, message: 'Company created successfully' };
    }
  }

  if (path === '/firms/profile') {
    if (method === 'PUT' || method === 'POST') {
      const idx = store.firms.findIndex((f: any) => f.id === currentFirmId);
      if (idx !== -1) {
        store.firms[idx] = { ...store.firms[idx], ...body };
        saveStore(store);
        return { success: true, data: store.firms[idx], message: 'Firm details updated' };
      }
    }
    return { success: true, data: currentFirm };
  }

  if (path === '/firms/users') {
    return {
      success: true,
      data: [
        { id: 'usr-1', name: 'Eleanor Vance', email: 'admin@acme.co.uk', role: 'ADMIN', createdAt: '2026-01-01' },
        { id: 'usr-2', name: 'David Croft', email: 'accountant@acme.co.uk', role: 'ACCOUNTANT', createdAt: '2026-01-05' },
        { id: 'usr-3', name: 'Sarah Connor', email: 'user@acme.co.uk', role: 'USER', createdAt: '2026-01-10' },
        { id: 'usr-4', name: 'Emma Watson', email: 'staff@acme.co.uk', role: 'USER', createdAt: '2026-01-15' },
      ],
    };
  }

  if (path.startsWith('/firms/') && path.endsWith('/status')) {
    const firmId = path.split('/')[2];
    const firm = store.firms.find((f: any) => f.id === firmId);
    if (firm) {
      firm.isActive = Boolean(body.isActive);
      saveStore(store);
      return { success: true, data: firm, message: `Company ${firm.isActive ? 'activated' : 'deactivated'} successfully` };
    }
    return { success: false, error: { message: 'Company not found' } };
  }

  if (path.startsWith('/firms/') && path.split('/').length === 3) {
    const firmId = path.split('/')[2];
    const firm = store.firms.find((f: any) => f.id === firmId);
    if (firm) {
      if (method === 'PUT') {
        Object.assign(firm, body);
        saveStore(store);
        return { success: true, data: firm, message: 'Company updated successfully' };
      }
      return { success: true, data: firm };
    }
    return { success: false, error: { message: 'Company not found' } };
  }

  // ==========================================
  // SCOPED COMPANY TRANSACTIONS
  // ==========================================
  const firmInvoices = store.invoices.filter((i: any) => (i.firmId || 'demo-firm-acme') === currentFirmId);
  const firmExpenses = store.expenses.filter((e: any) => (e.firmId || 'demo-firm-acme') === currentFirmId);
  const firmCustomers = store.customers.filter((c: any) => (c.firmId || 'demo-firm-acme') === currentFirmId);
  const firmSuppliers = store.suppliers.filter((s: any) => (s.firmId || 'demo-firm-acme') === currentFirmId);
  const firmPayments = store.payments.filter((p: any) => (p.firmId || 'demo-firm-acme') === currentFirmId);
  const firmAuditLogs = (store.auditLogs || []).filter((l: any) => (l.firmId || 'demo-firm-acme') === currentFirmId);

  // Dashboard reports
  if (path === '/reports/dashboard') {
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalRevenue = activeInvoices.reduce((acc: number, i: any) => acc + i.total, 0);
    const invoiceCount = activeInvoices.length;

    const unpaidInvoices = activeInvoices.filter((i: any) => i.status !== 'PAID');
    const totalOutstanding = unpaidInvoices.reduce((acc: number, i: any) => acc + Number(i.balanceDue || 0), 0);
    const unpaidCount = unpaidInvoices.length;

    const now = new Date();
    const overdueInvoices = unpaidInvoices.filter((i: any) => new Date(i.dueDate) < now);
    const totalOverdue = overdueInvoices.reduce((acc: number, i: any) => acc + Number(i.balanceDue || 0), 0);
    const overdueCount = overdueInvoices.length;

    const totalExpenses = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.total || e.amount || 0), 0);

    // VAT Liability = Output VAT (Sales) - Input VAT (Purchases)
    const totalOutputVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.vatTotal || 0), 0);
    const totalInputVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);
    const estimatedVatLiability = totalOutputVat - totalInputVat;

    const totalCashCollected = firmPayments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

    const attentionItems = [];
    if (overdueCount > 0) {
      attentionItems.push({
        id: 'att-overdue',
        title: `${overdueCount} Overdue Customer Invoice${overdueCount > 1 ? 's' : ''}`,
        message: `Total overdue balance of £${totalOverdue.toFixed(2)} requires immediate action`,
        severity: 'error',
      });
    }

    attentionItems.push({
      id: 'att-vat',
      title: 'HMRC MTD VAT Return 2026-Q3 Due',
      message: `Current Net VAT Liability is £${estimatedVatLiability.toFixed(2)}. Due 07 Nov 2026.`,
      severity: estimatedVatLiability > 0 ? 'warning' : 'info',
    });

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue: totalRevenue.toFixed(2),
          invoiceCount,
          totalOutstanding: totalOutstanding.toFixed(2),
          unpaidCount,
          totalOverdue: totalOverdue.toFixed(2),
          overdueCount,
          totalExpenses: totalExpenses.toFixed(2),
          estimatedVatLiability: estimatedVatLiability.toFixed(2),
          totalCashCollected: totalCashCollected.toFixed(2),
        },
        attentionItems,
        overdueInvoices: overdueInvoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          dueDate: inv.dueDate,
          balanceDue: inv.balanceDue,
        })),
        monthlyTrend: [
          { month: 'Apr', revenue: Math.round(totalRevenue * 0.15), expenses: Math.round(totalExpenses * 0.12) },
          { month: 'May', revenue: Math.round(totalRevenue * 0.2), expenses: Math.round(totalExpenses * 0.18) },
          { month: 'Jun', revenue: Math.round(totalRevenue * 0.25), expenses: Math.round(totalExpenses * 0.2) },
          { month: 'Jul', revenue: Math.round(totalRevenue * 0.22), expenses: Math.round(totalExpenses * 0.25) },
          { month: 'Aug', revenue: Math.round(totalRevenue * 0.18), expenses: Math.round(totalExpenses * 0.25) },
        ],
        recentActivity: firmAuditLogs.slice(0, 8).map((log: any) => ({
          id: log.id,
          action: log.action,
          user: typeof log.user === 'object' ? log.user?.name || log.user?.email || 'System' : (log.user || 'System'),
          description: log.description || log.metadata,
          timestamp: log.timestamp || log.createdAt,
        })),
      },
    };
  }

  // Customers
  if (path === '/customers') {
    if (method === 'GET') {
      const searchParam = url.searchParams.get('search');
      let result = firmCustomers;
      if (searchParam) {
        const q = searchParam.toLowerCase();
        result = result.filter(
          (c: any) =>
            c.name.toLowerCase().includes(q) ||
            c.companyName?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.postcode?.toLowerCase().includes(q)
        );
      }
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const newCust = {
        id: `cust-${Date.now()}`,
        firmId: currentFirmId,
        name: body.name || 'New Customer',
        companyName: body.companyName || body.name,
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        postcode: body.postcode || '',
        vatNumber: body.vatNumber || '',
        notes: body.notes || '',
        outstandingBalance: 0.0,
      };
      store.customers.unshift(newCust);
      saveStore(store);
      return { success: true, data: newCust };
    }
  }

  if (path.startsWith('/customers/')) {
    const custId = path.split('/')[2];
    const cust = firmCustomers.find((c: any) => c.id === custId);
    if (cust) {
      const custInvoices = firmInvoices.filter((i: any) => i.customerId === custId);
      return { success: true, data: { ...cust, invoices: custInvoices } };
    }
    return { success: false, error: { message: 'Customer not found' } };
  }

  // Suppliers
  if (path === '/suppliers') {
    if (method === 'GET') {
      const searchParam = url.searchParams.get('search');
      let result = firmSuppliers;
      if (searchParam) {
        const q = searchParam.toLowerCase();
        result = result.filter(
          (s: any) =>
            s.name.toLowerCase().includes(q) ||
            s.companyName?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
      }
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const newSupp = {
        id: `supp-${Date.now()}`,
        firmId: currentFirmId,
        name: body.name || 'New Supplier',
        companyName: body.companyName || body.name,
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        postcode: body.postcode || '',
        vatNumber: body.vatNumber || '',
        notes: body.notes || '',
        totalExpenses: 0.0,
      };
      store.suppliers.unshift(newSupp);
      saveStore(store);
      return { success: true, data: newSupp };
    }
  }

  if (path.startsWith('/suppliers/')) {
    const suppId = path.split('/')[2];
    const supp = firmSuppliers.find((s: any) => s.id === suppId);
    if (supp) {
      const suppExpenses = firmExpenses.filter((e: any) => e.supplierId === suppId);
      return { success: true, data: { ...supp, expenses: suppExpenses } };
    }
    return { success: false, error: { message: 'Supplier not found' } };
  }

  // Invoices
  if (path === '/invoices') {
    if (method === 'GET') {
      const statusParam = url.searchParams.get('status');
      let result = firmInvoices;
      if (statusParam) {
        result = result.filter((i: any) => i.status === statusParam);
      }
      return { success: true, data: result };
    }

    if (method === 'POST') {
      const cust = firmCustomers.find((c: any) => c.id === body.customerId);
      const items = (body.items || []).map((it: any, idx: number) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0;
        const rate = Number(it.vatRate) !== undefined ? Number(it.vatRate) : 20;
        const lineSub = Math.round(qty * price * 100) / 100;
        const lineVat = Math.round(lineSub * (rate / 100) * 100) / 100;
        return {
          id: `item-${Date.now()}-${idx}`,
          description: it.description,
          quantity: qty,
          unitPrice: price,
          vatRate: rate,
          subtotal: lineSub,
          vatAmount: lineVat,
          total: lineSub + lineVat,
        };
      });

      const subtotal = Math.round(items.reduce((acc: number, it: any) => acc + it.subtotal, 0) * 100) / 100;
      const vatTotal = Math.round(items.reduce((acc: number, it: any) => acc + it.vatAmount, 0) * 100) / 100;
      const total = Math.round((subtotal + vatTotal) * 100) / 100;

      const newInv = {
        id: `inv-${Date.now()}`,
        firmId: currentFirmId,
        invoiceNumber: body.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        customerId: body.customerId,
        customerName: cust ? cust.name : 'Sample Customer',
        customer: cust || { name: 'Sample Customer' },
        status: 'SENT',
        issueDate: body.issueDate || new Date().toISOString().split('T')[0],
        dueDate: body.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        subtotal,
        vatTotal,
        total,
        amountPaid: 0.0,
        balanceDue: total,
        notes: body.notes || '',
        items,
        payments: [],
      };

      if (cust) {
        cust.outstandingBalance = (cust.outstandingBalance || 0) + total;
      }

      store.invoices.unshift(newInv);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        firmId: currentFirmId,
        action: 'INVOICE_CREATED',
        description: `Created invoice ${newInv.invoiceNumber} for ${newInv.customerName} (£${total.toFixed(2)})`,
        user: 'Demo User',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newInv };
    }
  }

  // Invoice status & detail
  if (path.startsWith('/invoices/') && path.endsWith('/status')) {
    const invId = path.split('/')[2];
    const inv = firmInvoices.find((i: any) => i.id === invId);
    if (inv) {
      inv.status = body.status;
      saveStore(store);
      return { success: true, data: inv };
    }
  }

  if (path.startsWith('/invoices/')) {
    const invId = path.split('/')[2];
    const inv = firmInvoices.find((i: any) => i.id === invId);
    if (inv) {
      return { success: true, data: inv };
    }
    return { success: false, error: { message: 'Invoice not found' } };
  }

  // Expenses
  if (path === '/expenses') {
    if (method === 'GET') {
      let result = firmExpenses;
      const catParam = url.searchParams.get('category');
      const searchParam = url.searchParams.get('search');
      if (catParam) {
        result = result.filter((e: any) => e.category === catParam);
      }
      if (searchParam) {
        const q = searchParam.toLowerCase();
        result = result.filter((e: any) => e.description.toLowerCase().includes(q) || e.supplierName?.toLowerCase().includes(q));
      }
      return { success: true, data: result };
    }

    if (method === 'POST') {
      const supp = firmSuppliers.find((s: any) => s.id === body.supplierId);
      const netAmount = Number(body.amount) || 0;
      const vatRate = Number(body.vatRate) !== undefined ? Number(body.vatRate) : 20;
      // Formula: VAT = Net x (rate / 100), Gross = Net + VAT
      const vatAmount = Math.round(netAmount * (vatRate / 100) * 100) / 100;
      const grossTotal = Math.round((netAmount + vatAmount) * 100) / 100;

      const newExp = {
        id: `exp-${Date.now()}`,
        firmId: currentFirmId,
        expenseNumber: `EXP-2026-${Math.floor(10 + Math.random() * 90)}`,
        supplierId: body.supplierId || (supp ? supp.id : null),
        supplierName: supp ? supp.name : body.supplierName || 'General Supplier',
        category: body.category || 'General Operating',
        description: body.description || 'Business Expense',
        date: body.date || new Date().toISOString().split('T')[0],
        amount: netAmount,
        vatRate,
        vatAmount,
        total: grossTotal,
        paymentStatus: body.paymentStatus || 'PAID',
      };

      if (supp) {
        supp.totalExpenses = (supp.totalExpenses || 0) + grossTotal;
      }

      store.expenses.unshift(newExp);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        firmId: currentFirmId,
        action: 'EXPENSE_RECORDED',
        description: `Recorded expense ${newExp.expenseNumber} for ${newExp.supplierName} (£${grossTotal.toFixed(2)})`,
        user: 'Demo User',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newExp };
    }
  }

  if (path.startsWith('/expenses/') && method === 'DELETE') {
    const expId = path.split('/')[2];
    store.expenses = store.expenses.filter((e: any) => e.id !== expId);
    saveStore(store);
    return { success: true, data: { message: 'Expense deleted successfully' } };
  }

  // Payments
  if (path === '/payments') {
    if (method === 'GET') {
      return { success: true, data: firmPayments };
    }
    if (method === 'POST') {
      const inv = firmInvoices.find((i: any) => i.id === body.invoiceId);
      const amount = Number(body.amount) || 0;

      const newPmt = {
        id: `pmt-${Date.now()}`,
        firmId: currentFirmId,
        invoiceId: body.invoiceId || null,
        invoiceNumber: inv ? inv.invoiceNumber : body.reference || 'REF-INTERNAL',
        customerName: inv ? inv.customerName : body.contactName || 'Customer',
        amount,
        paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
        method: body.method || 'BANK_TRANSFER',
        reference: body.reference || `TRX-${Date.now()}`,
        status: 'CONFIRMED',
      };

      if (inv) {
        inv.amountPaid = Math.round(((inv.amountPaid || 0) + amount) * 100) / 100;
        inv.balanceDue = Math.max(0, Math.round((inv.total - inv.amountPaid) * 100) / 100);
        if (inv.balanceDue === 0) {
          inv.status = 'PAID';
        } else {
          inv.status = 'PARTIALLY_PAID';
        }
        inv.payments = inv.payments || [];
        inv.payments.unshift(newPmt);

        const cust = firmCustomers.find((c: any) => c.id === inv.customerId);
        if (cust) {
          cust.outstandingBalance = Math.max(0, Math.round(((cust.outstandingBalance || 0) - amount) * 100) / 100);
        }
      }

      store.payments.unshift(newPmt);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        firmId: currentFirmId,
        action: 'PAYMENT_RECORDED',
        description: `Recorded payment of £${amount.toFixed(2)} for ${newPmt.invoiceNumber}`,
        user: 'Demo User',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newPmt };
    }
  }

  // Reports revenue, expense, vat
  if (path === '/reports/revenue') {
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalRev = activeInvoices.reduce((acc: number, i: any) => acc + i.total, 0);
    const totalVat = activeInvoices.reduce((acc: number, i: any) => acc + i.vatTotal, 0);
    return {
      success: true,
      data: {
        labels: ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
        datasets: [
          { label: 'Revenue (£)', data: [Math.round(totalRev * 0.2), Math.round(totalRev * 0.25), Math.round(totalRev * 0.3), Math.round(totalRev * 0.25)] },
          { label: 'VAT Collected (£)', data: [Math.round(totalVat * 0.2), Math.round(totalVat * 0.25), Math.round(totalVat * 0.3), Math.round(totalVat * 0.25)] },
        ],
        summary: {
          totalRevenue: totalRev.toFixed(2),
          totalVat: totalVat.toFixed(2),
          invoiceCount: activeInvoices.length,
        },
        invoices: activeInvoices,
      },
    };
  }

  if (path === '/reports/expense') {
    const totalExp = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.total || e.amount || 0), 0);
    const totalVatReclaimed = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);

    const categoryMap: Record<string, number> = {};
    for (const exp of firmExpenses) {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.total || exp.amount || 0);
    }

    return {
      success: true,
      data: {
        labels: Object.keys(categoryMap).length ? Object.keys(categoryMap) : ['IT Infrastructure', 'Office Expenses', 'Professional Fees'],
        datasets: [
          {
            label: 'Expenses (£)',
            data: Object.values(categoryMap).length ? Object.values(categoryMap) : [1440, 520, 3600],
          },
        ],
        summary: {
          totalExpenses: totalExp.toFixed(2),
          totalVatReclaimed: totalVatReclaimed.toFixed(2),
          expenseCount: firmExpenses.length,
        },
        categoryBreakdown: Object.entries(categoryMap).map(([category, amount]) => ({ category, amount: amount.toFixed(2) })),
        expenses: firmExpenses,
      },
    };
  }

  if (path === '/reports/vat') {
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalOutputVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.vatTotal || 0), 0);
    const totalSalesExVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);

    const totalInputVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);
    const totalPurchasesExVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);

    const netVatLiability = totalOutputVat - totalInputVat;

    return {
      success: true,
      data: {
        summary: {
          outputVat: totalOutputVat.toFixed(2),
          inputVat: totalInputVat.toFixed(2),
          netVatLiability: netVatLiability.toFixed(2),
          salesExVat: totalSalesExVat.toFixed(2),
          purchasesExVat: totalPurchasesExVat.toFixed(2),
          invoiceCount: activeInvoices.length,
          expenseCount: firmExpenses.length,
        },
        rateBreakdown: [
          { rate: 'Standard Rate (20%)', amount: totalSalesExVat.toFixed(2), description: 'Standard VAT sales' },
          { rate: 'Reduced Rate (5%)', amount: '0.00', description: 'Reduced rate supplies' },
          { rate: 'Zero Rate (0%)', amount: '0.00', description: 'Zero rated supplies' },
        ],
        recentTransactions: [
          ...activeInvoices.map((inv: any) => ({
            id: inv.id,
            type: 'SALE' as const,
            reference: inv.invoiceNumber,
            contact: inv.customerName,
            date: inv.issueDate,
            net: inv.subtotal,
            vat: inv.vatTotal,
            gross: inv.total,
          })),
          ...firmExpenses.map((exp: any) => ({
            id: exp.id,
            type: 'PURCHASE' as const,
            reference: exp.description,
            contact: exp.supplierName || exp.category,
            date: exp.date,
            net: exp.amount,
            vat: exp.vatAmount,
            gross: exp.total,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15),
      },
    };
  }

  // VAT Overview & Returns
  if (path === '/vat/overview') {
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalSalesVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.vatTotal || 0), 0);
    const totalSalesExVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);

    const totalPurchasesVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);
    const totalPurchasesExVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);

    const netVatPayable = totalSalesVat - totalPurchasesVat;

    const returnKey = `${currentFirmId}_2026-Q3`;
    const storedReturn = store.vatReturns?.[returnKey];

    return {
      success: true,
      data: {
        currentPeriod: {
          periodKey: '2026-Q3',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          dueDate: '2026-11-07',
          status: storedReturn?.status || 'OPEN',
        },
        liveCalculation: {
          period: { startDate: '2026-07-01', endDate: '2026-09-30' },
          box1: totalSalesVat.toFixed(2),
          box2: '0.00',
          box3: totalSalesVat.toFixed(2),
          box4: totalPurchasesVat.toFixed(2),
          box5: netVatPayable.toFixed(2),
          box6: totalSalesExVat.toFixed(2),
          box7: totalPurchasesExVat.toFixed(2),
          box8: '0.00',
          box9: '0.00',
          transactionCount: {
            invoices: activeInvoices.length,
            expenses: firmExpenses.length,
          },
        },
        obligations: [
          {
            id: `ob-1-${currentFirmId}`,
            periodKey: '2026-Q3',
            startPeriod: '2026-07-01',
            endPeriod: '2026-09-30',
            dueDate: '2026-11-07',
            status: storedReturn?.status === 'SUBMITTED' ? 'FULFILLED' : 'OPEN',
          },
          {
            id: `ob-2-${currentFirmId}`,
            periodKey: '2026-Q2',
            startPeriod: '2026-04-01',
            endPeriod: '2026-06-30',
            dueDate: '2026-08-07',
            status: 'FULFILLED',
          },
        ],
        returns: storedReturn
          ? [storedReturn]
          : [
              {
                id: `ret-prev-${currentFirmId}`,
                periodKey: '2026-Q2',
                startPeriod: '2026-04-01',
                endPeriod: '2026-06-30',
                box1: 1500.0,
                box4: 450.0,
                box5: 1050.0,
                status: 'SUBMITTED',
                submittedAt: '2026-08-05T15:20:00.000Z',
                hmrcCorrelationId: 'HMRC-ACK-2026Q2-DEMO',
              },
            ],
        hmrcConnectionStatus: {
          isConnected: false,
          vrn: currentFirm.vatNumber || null,
          environment: 'sandbox',
          lastSyncAt: null,
        },
      },
    };
  }

  if (path.startsWith('/vat/returns/') && path.endsWith('/prepare')) {
    const periodKey = path.split('/')[3];
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalSalesVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.vatTotal || 0), 0);
    const totalSalesExVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);

    const totalPurchasesVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);
    const totalPurchasesExVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);

    const netVatPayable = totalSalesVat - totalPurchasesVat;

    const returnKey = `${currentFirmId}_${periodKey}`;
    store.vatReturns = store.vatReturns || {};
    const vatRet = {
      id: `ret-${Date.now()}`,
      firmId: currentFirmId,
      periodKey,
      startPeriod: '2026-07-01',
      endPeriod: '2026-09-30',
      dueDate: '2026-11-07',
      box1: totalSalesVat.toFixed(2),
      box2: '0.00',
      box3: totalSalesVat.toFixed(2),
      box4: totalPurchasesVat.toFixed(2),
      box5: netVatPayable.toFixed(2),
      box6: totalSalesExVat.toFixed(2),
      box7: totalPurchasesExVat.toFixed(2),
      box8: '0.00',
      box9: '0.00',
      status: store.vatReturns[returnKey]?.status || 'DRAFT',
      submittedAt: store.vatReturns[returnKey]?.submittedAt || null,
      hmrcCorrelationId: store.vatReturns[returnKey]?.hmrcCorrelationId || null,
    };

    store.vatReturns[returnKey] = vatRet;
    saveStore(store);
    return { success: true, data: vatRet };
  }

  if (path.startsWith('/vat/returns/') && path.endsWith('/submit')) {
    const periodKey = path.split('/')[3];
    const returnKey = `${currentFirmId}_${periodKey}`;
    store.vatReturns = store.vatReturns || {};

    const ackId = `HMRC-DEMO-ACK-${Date.now()}`;
    const vatRet = store.vatReturns[returnKey] || {
      periodKey,
      box1: '2340.00',
      box4: '926.67',
      box5: '1413.33',
    };

    vatRet.status = 'SUBMITTED';
    vatRet.submittedAt = new Date().toISOString();
    vatRet.hmrcCorrelationId = ackId;
    store.vatReturns[returnKey] = vatRet;

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      firmId: currentFirmId,
      action: 'VAT_RETURN_SUBMITTED',
      description: `Submitted VAT Return for ${periodKey} (Demo Ack: ${ackId})`,
      user: 'Demo User',
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });

    saveStore(store);
    return {
      success: true,
      data: {
        status: 'SUBMITTED',
        receiptId: ackId,
        submittedAt: vatRet.submittedAt,
        message: 'VAT Return successfully submitted to HMRC (Demo Sandbox)',
      },
    };
  }

  if (path.startsWith('/hmrc/returns/') && path.endsWith('/submit')) {
    const periodKey = path.split('/')[3];
    const returnKey = `${currentFirmId}_${periodKey}`;
    store.vatReturns = store.vatReturns || {};

    const ackId = `HMRC-DEMO-ACK-${Date.now()}`;
    const vatRet = store.vatReturns[returnKey] || {
      periodKey,
      box1: '2340.00',
      box4: '926.67',
      box5: '1413.33',
    };

    vatRet.status = 'SUBMITTED';
    vatRet.submittedAt = new Date().toISOString();
    vatRet.hmrcCorrelationId = ackId;
    store.vatReturns[returnKey] = vatRet;
    saveStore(store);

    return {
      success: true,
      data: {
        status: 'SUBMITTED',
        receiptId: ackId,
        submittedAt: vatRet.submittedAt,
      },
    };
  }

  if (path.startsWith('/vat/returns/')) {
    const periodKey = path.split('/')[3];
    const returnKey = `${currentFirmId}_${periodKey}`;
    store.vatReturns = store.vatReturns || {};

    if (store.vatReturns[returnKey]) {
      return { success: true, data: store.vatReturns[returnKey] };
    }

    // Default return prepared on the fly
    const activeInvoices = firmInvoices.filter((i: any) => i.status !== 'CANCELLED');
    const totalSalesVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.vatTotal || 0), 0);
    const totalSalesExVat = activeInvoices.reduce((acc: number, i: any) => acc + Number(i.subtotal || 0), 0);
    const totalPurchasesVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.vatAmount || 0), 0);
    const totalPurchasesExVat = firmExpenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
    const netVatPayable = totalSalesVat - totalPurchasesVat;

    const defaultRet = {
      periodKey,
      startPeriod: '2026-07-01',
      endPeriod: '2026-09-30',
      dueDate: '2026-11-07',
      box1: totalSalesVat.toFixed(2),
      box2: '0.00',
      box3: totalSalesVat.toFixed(2),
      box4: totalPurchasesVat.toFixed(2),
      box5: netVatPayable.toFixed(2),
      box6: totalSalesExVat.toFixed(2),
      box7: totalPurchasesExVat.toFixed(2),
      box8: '0.00',
      box9: '0.00',
      status: 'DRAFT',
    };
    return { success: true, data: defaultRet };
  }

  // Integrations (Xero)
  if (path === '/xero/status' || path === '/integrations/xero/status') {
    return {
      success: true,
      data: {
        connected: true,
        tenantName: currentFirm.name,
        lastSync: new Date().toISOString(),
      },
    };
  }

  if (path === '/xero/connect') {
    return { success: true, data: { url: '#demo-connected' } };
  }

  if (path === '/xero/disconnect') {
    return { success: true, data: { message: 'Disconnected' } };
  }

  if (path === '/xero/sync') {
    return { success: true, data: { message: 'Synced successfully with Xero' } };
  }

  if (path === '/audit') {
    return { success: true, data: firmAuditLogs };
  }

  return { success: true, data: {} };
}
