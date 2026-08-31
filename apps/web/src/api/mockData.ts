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
    name: 'Sarah Connor',
    role: 'ADMIN',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'accountant@acme.co.uk': {
    id: 'demo-user-accountant',
    email: 'accountant@acme.co.uk',
    name: 'David Wright',
    role: 'ACCOUNTANT',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'user@acme.co.uk': {
    id: 'demo-user-staff',
    email: 'user@acme.co.uk',
    name: 'Emma Watson',
    role: 'USER',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
  'staff@acme.co.uk': {
    id: 'demo-user-staff',
    email: 'staff@acme.co.uk',
    name: 'Emma Watson',
    role: 'USER',
    firmId: 'demo-firm-acme',
    firmName: 'Acme Consulting Ltd',
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB987654321',
    },
    demo: true,
  },
};

const STORAGE_KEY = 'finora_demo_db_v1';

function getDefaultStore() {
  return {
    firm: {
      id: 'demo-firm-acme',
      name: 'Acme Consulting Ltd',
      companyNumber: '09876543',
      vatNumber: 'GB987654321',
      address: '100 Bishopsgate, London',
      postcode: 'EC2N 4AG',
      email: 'finance@acme.co.uk',
      phone: '020 7946 0000',
    },
    customers: [
      {
        id: 'cust-1',
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
    ],
    suppliers: [
      {
        id: 'supp-1',
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
    ],
    invoices: [
      {
        id: 'inv-1',
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
    ],
    expenses: [
      {
        id: 'exp-1',
        expenseNumber: 'EXP-2026-01',
        supplierId: 'supp-1',
        supplierName: 'CloudHost UK Ltd',
        category: 'IT Infrastructure',
        description: 'AWS & UK Cloud Server Hosting',
        date: '2026-08-10',
        amount: 1440.0,
        vatAmount: 240.0,
        vatRate: 20,
        status: 'APPROVED',
      },
      {
        id: 'exp-2',
        expenseNumber: 'EXP-2026-02',
        supplierId: 'supp-2',
        supplierName: 'Premier Office Supplies Ltd',
        category: 'Office Expenses',
        description: 'Ergonomic Chairs & Desk Setup',
        date: '2026-08-14',
        amount: 520.0,
        vatAmount: 86.67,
        vatRate: 20,
        status: 'APPROVED',
      },
      {
        id: 'exp-3',
        expenseNumber: 'EXP-2026-03',
        supplierId: 'supp-3',
        supplierName: 'City Legal & Advisory LLP',
        category: 'Professional Fees',
        description: 'Annual Compliance Audit & Legal Advisory',
        date: '2026-08-05',
        amount: 3600.0,
        vatAmount: 600.0,
        vatRate: 20,
        status: 'APPROVED',
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
        action: 'INVOICE_CREATED',
        description: 'Created invoice INV-2026-103 for Thames Logistics Ltd (£1,440.00)',
        user: 'Sarah Connor',
        createdAt: '2026-08-20T10:15:00.000Z',
        timestamp: '2026-08-20T10:15:00.000Z',
      },
      {
        id: 'audit-2',
        action: 'PAYMENT_RECORDED',
        description: 'Recorded £6,000.00 BACS payment for INV-2026-102',
        user: 'David Wright',
        createdAt: '2026-08-02T14:30:00.000Z',
        timestamp: '2026-08-02T14:30:00.000Z',
      },
      {
        id: 'audit-3',
        action: 'EXPENSE_APPROVED',
        description: 'Approved expense EXP-2026-01 for CloudHost UK Ltd (£1,440.00)',
        user: 'Emma Watson',
        createdAt: '2026-08-10T11:00:00.000Z',
        timestamp: '2026-08-10T11:00:00.000Z',
      },
      {
        id: 'audit-4',
        action: 'HMRC_MTD_VERIFIED',
        description: 'HMRC Making Tax Digital OAuth 2.0 connection token refreshed',
        user: 'Sarah Connor',
        createdAt: '2026-08-01T09:00:00.000Z',
        timestamp: '2026-08-01T09:00:00.000Z',
      },
    ],
    vatReturns: {
      '2026-Q3': {
        periodKey: '2026-Q3',
        dateFrom: '2026-07-01',
        dateTo: '2026-09-30',
        dueDate: '2026-11-07',
        status: 'OPEN',
        box1: 2340.0,
        box2: 0.0,
        box3: 2340.0,
        box4: 926.67,
        box5: 1413.33,
        box6: 11700.0,
        box7: 4633.33,
        box8: 0.0,
        box9: 0.0,
      },
      '2026-Q2': {
        periodKey: '2026-Q2',
        dateFrom: '2026-04-01',
        dateTo: '2026-06-30',
        dueDate: '2026-08-07',
        status: 'SUBMITTED',
        box1: 1500.0,
        box2: 0.0,
        box3: 1500.0,
        box4: 450.0,
        box5: 1050.0,
        box6: 7500.0,
        box7: 2250.0,
        box8: 0.0,
        box9: 0.0,
        submittedAt: '2026-08-05T15:20:00.000Z',
      },
    },
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
      return { success: true, data: JSON.parse(savedUser) };
    }
    return { success: true, data: DEMO_USERS['admin@acme.co.uk'] };
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
          user,
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

  // Dashboard reports
  if (path === '/reports/dashboard') {
    const totalRevenue = store.invoices.reduce((acc: number, i: any) => acc + (i.status !== 'CANCELLED' ? i.total : 0), 0);
    const invoiceCount = store.invoices.length;
    const unpaidInvoices = store.invoices.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED');
    const totalOutstanding = unpaidInvoices.reduce((acc: number, i: any) => acc + i.balanceDue, 0);
    const unpaidCount = unpaidInvoices.length;
    const overdueInvoices = store.invoices.filter((i: any) => i.status === 'OVERDUE');
    const totalOverdue = overdueInvoices.reduce((acc: number, i: any) => acc + i.balanceDue, 0);
    const overdueCount = overdueInvoices.length;
    const totalExpenses = store.expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
    const totalVatSales = store.invoices.reduce((acc: number, i: any) => acc + (i.status !== 'CANCELLED' ? i.vatTotal : 0), 0);
    const totalVatExpenses = store.expenses.reduce((acc: number, e: any) => acc + e.vatAmount, 0);
    const estimatedVatLiability = totalVatSales - totalVatExpenses;
    const totalCashCollected = store.payments.reduce((acc: number, p: any) => acc + p.amount, 0);

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue,
          invoiceCount,
          totalOutstanding,
          unpaidCount,
          totalOverdue,
          overdueCount,
          totalExpenses,
          estimatedVatLiability,
          totalCashCollected,
        },
        attentionItems: [
          {
            id: 'att-1',
            title: 'HMRC MTD VAT Return 2026-Q3 Due',
            message: 'VAT return period ends 30 Sept 2026. Estimated net payable: £1,413.33',
            severity: 'warning',
          },
          {
            id: 'att-2',
            title: `${overdueCount} Overdue Customer Invoices`,
            message: `Total outstanding overdue balance: £${totalOverdue.toFixed(2)}`,
            severity: 'error',
          },
        ],
        overdueInvoices: overdueInvoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          dueDate: inv.dueDate,
          balanceDue: inv.balanceDue,
        })),
        monthlyTrend: [
          { month: 'Apr', revenue: 4200, expenses: 1800 },
          { month: 'May', revenue: 5100, expenses: 2100 },
          { month: 'Jun', revenue: 3000, expenses: 1500 },
          { month: 'Jul', revenue: 6000, expenses: 2200 },
          { month: 'Aug', revenue: 5040, expenses: 5560 },
        ],
        recentActivity: (store.auditLogs || []).map((log: any) => ({
          id: log.id,
          action: log.action,
          user: typeof log.user === 'object' ? log.user?.name || log.user?.email || 'System' : (log.user || 'System'),
          description: log.description,
          timestamp: log.timestamp || log.createdAt,
        })),
      },
    };
  }

  // Customers
  if (path === '/customers') {
    if (method === 'GET') {
      const searchParam = url.searchParams.get('search');
      let result = store.customers;
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
    const cust = store.customers.find((c: any) => c.id === custId);
    if (cust) {
      const custInvoices = store.invoices.filter((i: any) => i.customerId === custId);
      return { success: true, data: { ...cust, invoices: custInvoices } };
    }
    return { success: false, error: { message: 'Customer not found' } };
  }

  // Suppliers
  if (path === '/suppliers') {
    if (method === 'GET') {
      const searchParam = url.searchParams.get('search');
      let result = store.suppliers;
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
    const supp = store.suppliers.find((s: any) => s.id === suppId);
    if (supp) {
      const suppExpenses = store.expenses.filter((e: any) => e.supplierId === suppId);
      return { success: true, data: { ...supp, expenses: suppExpenses } };
    }
    return { success: false, error: { message: 'Supplier not found' } };
  }

  // Invoices
  if (path === '/invoices') {
    if (method === 'GET') {
      const statusParam = url.searchParams.get('status');
      let result = store.invoices;
      if (statusParam) {
        result = result.filter((i: any) => i.status === statusParam);
      }
      return { success: true, data: result };
    }
    if (method === 'POST') {
      const cust = store.customers.find((c: any) => c.id === body.customerId);
      const items = (body.items || []).map((it: any, idx: number) => {
        const lineSub = Math.round(it.quantity * it.unitPrice * 100) / 100;
        const lineVat = Math.round(lineSub * (it.vatRate / 100) * 100) / 100;
        return {
          id: `item-${Date.now()}-${idx}`,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          vatRate: it.vatRate,
          subtotal: lineSub,
          vatAmount: lineVat,
          total: lineSub + lineVat,
        };
      });

      const subtotal = items.reduce((acc: number, it: any) => acc + it.subtotal, 0);
      const vatTotal = items.reduce((acc: number, it: any) => acc + it.vatAmount, 0);
      const total = subtotal + vatTotal;

      const newInv = {
        id: `inv-${Date.now()}`,
        invoiceNumber: body.invoiceNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        customerId: body.customerId,
        customerName: cust ? cust.name : 'Sample Customer',
        customer: cust || { name: 'Sample Customer' },
        status: 'ISSUED',
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
        cust.outstandingBalance += total;
      }

      store.invoices.unshift(newInv);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'INVOICE_CREATED',
        description: `Created invoice ${newInv.invoiceNumber} for ${newInv.customerName} (£${total.toFixed(2)})`,
        user: { name: 'Demo User', email: 'demo@acme.co.uk' },
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newInv };
    }
  }

  // Invoice Detail & Status update
  if (path.startsWith('/invoices/') && path.endsWith('/status')) {
    const invId = path.split('/')[2];
    const inv = store.invoices.find((i: any) => i.id === invId);
    if (inv) {
      inv.status = body.status;
      saveStore(store);
      return { success: true, data: inv };
    }
  }

  if (path.startsWith('/invoices/')) {
    const invId = path.split('/')[2];
    const inv = store.invoices.find((i: any) => i.id === invId);
    if (inv) {
      return { success: true, data: inv };
    }
    return { success: false, error: { message: 'Invoice not found' } };
  }

  // Expenses
  if (path === '/expenses') {
    if (method === 'GET') {
      return { success: true, data: store.expenses };
    }
    if (method === 'POST') {
      const supp = store.suppliers.find((s: any) => s.id === body.supplierId);
      const amt = Number(body.amount) || 0;
      const vatRate = Number(body.vatRate) || 20;
      const vatAmount = Math.round((amt * (vatRate / 120)) * 100) / 100;

      const newExp = {
        id: `exp-${Date.now()}`,
        expenseNumber: `EXP-2026-${Math.floor(10 + Math.random() * 90)}`,
        supplierId: body.supplierId || (supp ? supp.id : null),
        supplierName: supp ? supp.name : body.supplierName || 'General Supplier',
        category: body.category || 'General Operating',
        description: body.description || 'Business Expense',
        date: body.date || new Date().toISOString().split('T')[0],
        amount: amt,
        vatAmount,
        vatRate,
        status: 'APPROVED',
      };

      if (supp) {
        supp.totalExpenses += amt;
      }

      store.expenses.unshift(newExp);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'EXPENSE_CREATED',
        description: `Recorded expense ${newExp.expenseNumber} for ${newExp.supplierName} (£${amt.toFixed(2)})`,
        user: { name: 'Demo User', email: 'demo@acme.co.uk' },
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
      return { success: true, data: store.payments };
    }
    if (method === 'POST') {
      const inv = store.invoices.find((i: any) => i.id === body.invoiceId);
      const amount = Number(body.amount) || 0;

      const newPmt = {
        id: `pmt-${Date.now()}`,
        invoiceId: body.invoiceId,
        invoiceNumber: inv ? inv.invoiceNumber : 'INV-UNKNOWN',
        customerName: inv ? inv.customerName : 'Customer',
        amount,
        paymentDate: new Date().toISOString().split('T')[0],
        method: body.method || 'BANK_TRANSFER',
        reference: body.reference || `TRX-${Date.now()}`,
        status: 'CONFIRMED',
      };

      if (inv) {
        inv.amountPaid += amount;
        inv.balanceDue = Math.max(0, inv.total - inv.amountPaid);
        if (inv.balanceDue === 0) {
          inv.status = 'PAID';
        } else {
          inv.status = 'PARTIALLY_PAID';
        }
        inv.payments = inv.payments || [];
        inv.payments.unshift(newPmt);

        const cust = store.customers.find((c: any) => c.id === inv.customerId);
        if (cust) {
          cust.outstandingBalance = Math.max(0, cust.outstandingBalance - amount);
        }
      }

      store.payments.unshift(newPmt);
      store.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'PAYMENT_RECORDED',
        description: `Recorded payment of £${amount.toFixed(2)} for invoice ${newPmt.invoiceNumber}`,
        user: { name: 'Demo User', email: 'demo@acme.co.uk' },
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      saveStore(store);
      return { success: true, data: newPmt };
    }
  }

  // Reports revenue & expense
  if (path === '/reports/revenue') {
    const totalRev = store.invoices.reduce((acc: number, i: any) => acc + i.total, 0);
    const totalVat = store.invoices.reduce((acc: number, i: any) => acc + i.vatTotal, 0);
    return {
      success: true,
      data: {
        labels: ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026'],
        datasets: [
          { label: 'Revenue (£)', data: [5100, 3000, 6000, 5040] },
          { label: 'VAT Collected (£)', data: [1020, 600, 1200, 1008] },
        ],
        summary: {
          totalRevenue: totalRev,
          totalVat,
          invoiceCount: store.invoices.length,
        },
      },
    };
  }

  if (path === '/reports/expense') {
    const totalExp = store.expenses.reduce((acc: number, e: any) => acc + e.amount, 0);
    const totalVatReclaimed = store.expenses.reduce((acc: number, e: any) => acc + e.vatAmount, 0);
    return {
      success: true,
      data: {
        labels: ['IT Infrastructure', 'Office Expenses', 'Professional Fees'],
        datasets: [
          {
            label: 'Expenses (£)',
            data: [1440, 520, 3600],
          },
        ],
        summary: {
          totalExpenses: totalExp,
          totalVatReclaimed,
          expenseCount: store.expenses.length,
        },
      },
    };
  }

  // VAT Overview & Returns
  if (path === '/vat/overview') {
    return {
      success: true,
      data: {
        period: '2026-Q3 (Jul - Sep 2026)',
        vatDueSales: 2340.0,
        vatReclaimedPurchases: 926.67,
        netVatPayable: 1413.33,
        totalSalesExVat: 11700.0,
        totalPurchasesExVat: 4633.33,
        status: 'OPEN',
        openReturns: [
          {
            periodKey: '2026-Q3',
            dateFrom: '2026-07-01',
            dateTo: '2026-09-30',
            dueDate: '2026-11-07',
            status: 'OPEN',
            netVat: 1413.33,
          },
          {
            periodKey: '2026-Q2',
            dateFrom: '2026-04-01',
            dateTo: '2026-06-30',
            dueDate: '2026-08-07',
            status: 'SUBMITTED',
            netVat: 1050.0,
          },
        ],
      },
    };
  }

  if (path.startsWith('/vat/returns/') && path.endsWith('/prepare')) {
    const periodKey = path.split('/')[3];
    const vatRet = store.vatReturns[periodKey] || store.vatReturns['2026-Q3'];
    return { success: true, data: vatRet };
  }

  if (path.startsWith('/vat/returns/')) {
    const periodKey = path.split('/')[3];
    const vatRet = store.vatReturns[periodKey] || store.vatReturns['2026-Q3'];
    return { success: true, data: vatRet };
  }

  if (path.startsWith('/hmrc/returns/') && path.endsWith('/submit')) {
    const periodKey = path.split('/')[3];
    if (store.vatReturns[periodKey]) {
      store.vatReturns[periodKey].status = 'SUBMITTED';
      store.vatReturns[periodKey].submittedAt = new Date().toISOString();
      saveStore(store);
    }
    return {
      success: true,
      data: {
        status: 'SUBMITTED',
        receiptId: `HMRC-ACK-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      },
    };
  }

  // Integrations (HMRC & Xero)
  if (path === '/hmrc/status' || path === '/integrations/hmrc/status') {
    return { success: true, data: store.integrations.hmrc };
  }

  if (path === '/xero/status' || path === '/integrations/xero/status') {
    return { success: true, data: store.integrations.xero };
  }

  if (path === '/hmrc/connect' || path === '/xero/connect') {
    return { success: true, data: { url: '#demo-connected' } };
  }

  if (path === '/hmrc/disconnect' || path === '/xero/disconnect') {
    return { success: true, data: { message: 'Disconnected' } };
  }

  if (path === '/xero/sync') {
    store.integrations.xero.lastSync = new Date().toISOString();
    saveStore(store);
    return { success: true, data: { message: 'Synced successfully with Xero' } };
  }

  // Firms profile, users, audit
  if (path === '/firms/profile') {
    if (method === 'PUT' || method === 'POST') {
      store.firm = { ...store.firm, ...body };
      saveStore(store);
    }
    return { success: true, data: store.firm };
  }

  if (path === '/firms/users') {
    return {
      success: true,
      data: [
        { id: 'usr-1', name: 'Sarah Connor', email: 'admin@acme.co.uk', role: 'ADMIN', status: 'ACTIVE' },
        { id: 'usr-2', name: 'David Wright', email: 'accountant@acme.co.uk', role: 'ACCOUNTANT', status: 'ACTIVE' },
        { id: 'usr-3', name: 'Emma Watson', email: 'user@acme.co.uk', role: 'USER', status: 'ACTIVE' },
      ],
    };
  }

  if (path === '/audit') {
    return { success: true, data: store.auditLogs };
  }

  // Fallback default mock response
  return { success: true, data: {} };
}
