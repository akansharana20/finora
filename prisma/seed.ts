import { PrismaClient, Role, CustomerStatus, SupplierStatus, InvoiceStatus, ExpensePaymentStatus, PaymentStatus, VatObligationStatus, VatReturnStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Finora V1 database seed...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.hmrcConnection.deleteMany();
  await prisma.xeroConnection.deleteMany();
  await prisma.vatReturn.deleteMany();
  await prisma.vatObligation.deleteMany();
  await prisma.vatRate.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Primary Demo Firm: Acme Consulting Ltd
  const acmeFirm = await prisma.firm.create({
    data: {
      name: 'Acme Consulting Ltd',
      companyNumber: '08123456',
      vatNumber: 'GB987654321',
      address: '100 Bishopsgate, City of London',
      postcode: 'EC2N 4AG',
      country: 'GB',
      currency: 'GBP',
    },
  });

  // 2. Secondary Demo Firm: Apex Digital Solutions Ltd (for Multi-Tenancy Testing)
  const apexFirm = await prisma.firm.create({
    data: {
      name: 'Apex Digital Solutions Ltd',
      companyNumber: '11987654',
      vatNumber: 'GB123456789',
      address: '12 Northern Quarter, Manchester',
      postcode: 'M4 1AL',
      country: 'GB',
      currency: 'GBP',
    },
  });

  console.log(`✅ Created firms: ${acmeFirm.name} (${acmeFirm.id}), ${apexFirm.name} (${apexFirm.id})`);

  // Users for Acme Consulting Ltd
  const adminUser = await prisma.user.create({
    data: {
      firmId: acmeFirm.id,
      email: 'admin@acme.co.uk',
      passwordHash,
      name: 'Eleanor Vance (Admin)',
      role: Role.ADMIN,
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      firmId: acmeFirm.id,
      email: 'accountant@acme.co.uk',
      passwordHash,
      name: 'David Croft (Accountant)',
      role: Role.ACCOUNTANT,
    },
  });

  const standardUser = await prisma.user.create({
    data: {
      firmId: acmeFirm.id,
      email: 'user@acme.co.uk',
      passwordHash,
      name: 'Sarah Connor (Staff)',
      role: Role.USER,
    },
  });

  // User for Apex Digital Solutions
  const apexAdmin = await prisma.user.create({
    data: {
      firmId: apexFirm.id,
      email: 'admin@apexdigital.co.uk',
      passwordHash,
      name: 'Marcus Brody (Apex Admin)',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Created users with RBAC roles.');

  // Default VAT Rates for Acme
  const vatRates = [
    { code: 'STANDARD', name: 'Standard Rate (20%)', rate: 20.0, isDefault: true, isSystem: true },
    { code: 'REDUCED', name: 'Reduced Rate (5%)', rate: 5.0, isDefault: false, isSystem: true },
    { code: 'ZERO', name: 'Zero Rate (0%)', rate: 0.0, isDefault: false, isSystem: true },
    { code: 'EXEMPT', name: 'Exempt (0%)', rate: 0.0, isDefault: false, isSystem: true },
  ];

  for (const rate of vatRates) {
    await prisma.vatRate.create({
      data: {
        firmId: acmeFirm.id,
        ...rate,
      },
    });
  }

  // 10 Realistic UK Customers
  const customerData = [
    { name: 'TechNorth Solutions Ltd', companyName: 'TechNorth Solutions', email: 'billing@technorth.co.uk', phone: '0161 496 0123', address: '45 Deansgate', postcode: 'M3 2AY', vatNumber: 'GB445566778' },
    { name: 'Highland Logistics Group', companyName: 'Highland Logistics', email: 'accounts@highlandlogistics.scot', phone: '0131 496 0888', address: '12 Princes Street', postcode: 'EH2 2ER', vatNumber: 'GB112233445' },
    { name: 'Bristol BioHealth Innovations', companyName: 'BioHealth Innovations', email: 'finance@biohealth.co.uk', phone: '0117 998 1200', address: 'Temple Quarter Science Park', postcode: 'BS1 6QS', vatNumber: 'GB998877665' },
    { name: 'Thames Media & Creative', companyName: 'Thames Media Ltd', email: 'invoices@thamesmedia.com', phone: '020 7946 0912', address: '88 Soho Square', postcode: 'W1D 3QP', vatNumber: 'GB334455667' },
    { name: 'Cotswold Retail Enterprises', companyName: 'Cotswold Retail', email: 'payables@cotswoldretail.co.uk', phone: '01242 554321', address: '14 High Street, Cheltenham', postcode: 'GL50 1DZ', vatNumber: 'GB778899001' },
    { name: 'Mersey Shipping & Freight', companyName: 'Mersey Shipping', email: 'finance@merseyshipping.co.uk', phone: '0151 496 0011', address: 'Albert Dock Chambers', postcode: 'L3 4AA', vatNumber: 'GB556677889' },
    { name: 'Cambridge AI Research Ltd', companyName: 'Cambridge AI Research', email: 'accounts@cambridge-ai.io', phone: '01223 889900', address: 'Silicon Fen Tech Park', postcode: 'CB4 0GA', vatNumber: 'GB223344556' },
    { name: 'Yorkshire Food & Beverage', companyName: 'Yorkshire F&B Group', email: 'invoices@yorkshirefb.co.uk', phone: '0113 496 0777', address: 'The Calls Plaza', postcode: 'LS2 7EY', vatNumber: 'GB889900112' },
    { name: 'Belfast Engineering Works', companyName: 'Belfast Engineering', email: 'admin@belfasteng.co.uk', phone: '028 9012 3456', address: 'Titanic Quarter', postcode: 'BT3 9EP', vatNumber: 'GB667788990' },
    { name: 'Cornwall Solar Systems', companyName: 'Cornwall Solar Ltd', email: 'accounts@cornwallsolar.co.uk', phone: '01872 990011', address: 'Truro Business Park', postcode: 'TR1 2XA', vatNumber: 'GB123987456' },
  ];

  const customers = [];
  for (const c of customerData) {
    const cust = await prisma.customer.create({
      data: {
        firmId: acmeFirm.id,
        ...c,
        status: CustomerStatus.ACTIVE,
      },
    });
    customers.push(cust);
  }
  console.log(`✅ Created ${customers.length} UK customers.`);

  // 8 Realistic UK Suppliers
  const supplierData = [
    { name: 'AWS UK Cloud Services', companyName: 'Amazon Web Services EMEA SARL', email: 'billing@aws.amazon.com', phone: '0800 496 0000', address: '1 Principal Place, Worship St', postcode: 'EC2A 2FA', vatNumber: 'GB899200001' },
    { name: 'British Telecom (BT)', companyName: 'British Telecommunications plc', email: 'corporate@bt.com', phone: '0800 800 150', address: 'One Braham, Braham St', postcode: 'E1 8EE', vatNumber: 'GB245719348' },
    { name: 'Octopus Energy for Business', companyName: 'Octopus Energy Ltd', email: 'business@octopus.energy', phone: '0808 164 1088', address: 'UK House, 164 Oxford St', postcode: 'W1D 1NN', vatNumber: 'GB226162260' },
    { name: 'WeWork Office Spaces', companyName: 'WeWork UK Operations Ltd', email: 'members@wework.com', phone: '020 3695 4900', address: '1 Fore Street Ave', postcode: 'EC2Y 9DT', vatNumber: 'GB254093821' },
    { name: 'KPMG Advisory UK', companyName: 'KPMG LLP', email: 'ukservice@kpmg.co.uk', phone: '020 7311 1000', address: '15 Canada Square, Canary Wharf', postcode: 'E14 5GL', vatNumber: 'GB791788109' },
    { name: 'Apple Business UK', companyName: 'Apple Retail UK Ltd', email: 'business_uk@apple.com', phone: '0800 048 0408', address: 'Regent Street', postcode: 'W1B 2EL', vatNumber: 'GB872714241' },
    { name: 'Dell Technologies Direct', companyName: 'Dell Corporation Ltd', email: 'orders@dell.co.uk', phone: '0800 085 4878', address: 'Cain Road, Bracknell', postcode: 'RG12 1LF', vatNumber: 'GB764350123' },
    { name: 'Trainline for Business', companyName: 'Trainline.com Limited', email: 'business@trainline.com', phone: '0333 202 2222', address: '120 Holborn', postcode: 'EC1N 2TD', vatNumber: 'GB792700300' },
  ];

  const suppliers = [];
  for (const s of supplierData) {
    const supp = await prisma.supplier.create({
      data: {
        firmId: acmeFirm.id,
        name: s.name,
        companyName: s.companyName,
        email: s.email,
        phone: s.phone,
        address: s.address,
        postcode: s.postcode,
        vatNumber: s.vatNumber,
        status: SupplierStatus.ACTIVE,
      },
    });
    suppliers.push(supp);
  }
  console.log(`✅ Created ${suppliers.length} UK suppliers.`);

  // 20+ Invoices with mixed states (DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE)
  const now = new Date();
  const invoiceConfigs = [
    { num: 'INV-2026-001', custIdx: 0, daysAgo: 90, dueDays: -60, status: InvoiceStatus.PAID, items: [{ desc: 'Cloud Architecture Architecture Review', qty: 10, unit: 1500 }] },
    { num: 'INV-2026-002', custIdx: 1, daysAgo: 85, dueDays: -55, status: InvoiceStatus.PAID, items: [{ desc: 'Logistics Software Optimization', qty: 25, unit: 850 }] },
    { num: 'INV-2026-003', custIdx: 2, daysAgo: 70, dueDays: -40, status: InvoiceStatus.PAID, items: [{ desc: 'BioTech Data Platform Setup', qty: 1, unit: 12500 }] },
    { num: 'INV-2026-004', custIdx: 3, daysAgo: 65, dueDays: -35, status: InvoiceStatus.PAID, items: [{ desc: 'Brand Strategy & Digital Campaign', qty: 40, unit: 250 }] },
    { num: 'INV-2026-005', custIdx: 4, daysAgo: 60, dueDays: -30, status: InvoiceStatus.PAID, items: [{ desc: 'E-commerce Integration Services', qty: 15, unit: 600 }] },
    { num: 'INV-2026-006', custIdx: 5, daysAgo: 50, dueDays: -20, status: InvoiceStatus.PARTIALLY_PAID, items: [{ desc: 'Port Operations System Audit', qty: 8, unit: 1200 }] },
    { num: 'INV-2026-007', custIdx: 6, daysAgo: 45, dueDays: -15, status: InvoiceStatus.OVERDUE, items: [{ desc: 'AI Infrastructure Consulting', qty: 20, unit: 950 }] },
    { num: 'INV-2026-008', custIdx: 7, daysAgo: 40, dueDays: -10, status: InvoiceStatus.OVERDUE, items: [{ desc: 'Supply Chain Analytics Workshop', qty: 2, unit: 4500 }] },
    { num: 'INV-2026-009', custIdx: 8, daysAgo: 35, dueDays: -5, status: InvoiceStatus.OVERDUE, items: [{ desc: 'Engineering ERP System Migration', qty: 1, unit: 18500 }] },
    { num: 'INV-2026-010', custIdx: 9, daysAgo: 30, dueDays: 0, status: InvoiceStatus.SENT, items: [{ desc: 'Renewable Energy Compliance Audit', qty: 12, unit: 800 }] },
    { num: 'INV-2026-011', custIdx: 0, daysAgo: 25, dueDays: 5, status: InvoiceStatus.SENT, items: [{ desc: 'DevOps Pipeline Automation', qty: 15, unit: 1100 }] },
    { num: 'INV-2026-012', custIdx: 1, daysAgo: 20, dueDays: 10, status: InvoiceStatus.SENT, items: [{ desc: 'Warehouse Management Support', qty: 30, unit: 180 }] },
    { num: 'INV-2026-013', custIdx: 2, daysAgo: 18, dueDays: 12, status: InvoiceStatus.PAID, items: [{ desc: 'Clinical Data Pipeline Retainer', qty: 1, unit: 6500 }] },
    { num: 'INV-2026-014', custIdx: 3, daysAgo: 15, dueDays: 15, status: InvoiceStatus.SENT, items: [{ desc: 'Q3 Media Buying Consultancy', qty: 50, unit: 140 }] },
    { num: 'INV-2026-015', custIdx: 4, daysAgo: 12, dueDays: 18, status: InvoiceStatus.SENT, items: [{ desc: 'POS Software Modernization', qty: 10, unit: 750 }] },
    { num: 'INV-2026-016', custIdx: 5, daysAgo: 10, dueDays: 20, status: InvoiceStatus.DRAFT, items: [{ desc: 'Custom Customs Declaration Module', qty: 1, unit: 9800 }] },
    { num: 'INV-2026-017', custIdx: 6, daysAgo: 8, dueDays: 22, status: InvoiceStatus.DRAFT, items: [{ desc: 'LLM Fine-tuning & Data Pipeline', qty: 40, unit: 450 }] },
    { num: 'INV-2026-018', custIdx: 7, daysAgo: 5, dueDays: 25, status: InvoiceStatus.SENT, items: [{ desc: 'Food Safety Compliance System', qty: 5, unit: 1600 }] },
    { num: 'INV-2026-019', custIdx: 8, daysAgo: 3, dueDays: 27, status: InvoiceStatus.DRAFT, items: [{ desc: 'Belfast Dockyard Tech Support', qty: 20, unit: 300 }] },
    { num: 'INV-2026-020', custIdx: 9, daysAgo: 1, dueDays: 29, status: InvoiceStatus.SENT, items: [{ desc: 'Solar Farm IoT Telemetry System', qty: 1, unit: 14200 }] },
    { num: 'INV-2026-021', custIdx: 0, daysAgo: 0, dueDays: 30, status: InvoiceStatus.DRAFT, items: [{ desc: 'Q4 Enterprise Advisory Retainer', qty: 1, unit: 15000 }] },
  ];

  const invoices = [];
  const payments = [];

  for (const cfg of invoiceConfigs) {
    const issueDate = new Date(now.getTime() - cfg.daysAgo * 86400000);
    const dueDate = new Date(issueDate.getTime() + (cfg.daysAgo + cfg.dueDays) * 86400000);
    const customer = customers[cfg.custIdx];

    let subtotal = 0;
    let vatTotal = 0;

    const itemsData = cfg.items.map((item) => {
      const lineSub = item.qty * item.unit;
      const lineVat = lineSub * 0.2;
      const lineTotal = lineSub + lineVat;
      subtotal += lineSub;
      vatTotal += lineVat;
      return {
        description: item.desc,
        quantity: item.qty,
        unitPrice: item.unit,
        vatRate: 20.0,
        vatAmount: lineVat,
        total: lineTotal,
      };
    });

    const total = subtotal + vatTotal;
    let amountPaid = 0;

    if (cfg.status === InvoiceStatus.PAID) {
      amountPaid = total;
    } else if (cfg.status === InvoiceStatus.PARTIALLY_PAID) {
      amountPaid = Math.round((total / 2) * 100) / 100;
    }

    const balanceDue = total - amountPaid;

    const invoice = await prisma.invoice.create({
      data: {
        firmId: acmeFirm.id,
        customerId: customer.id,
        invoiceNumber: cfg.num,
        issueDate,
        dueDate,
        status: cfg.status,
        subtotal,
        vatTotal,
        total,
        amountPaid,
        balanceDue,
        notes: `Standard payment terms: 30 days net. Thank you for your business.`,
        items: {
          create: itemsData,
        },
      },
    });
    invoices.push(invoice);

    // Create payment records for paid & partially paid invoices
    if (amountPaid > 0) {
      const pDate = new Date(issueDate.getTime() + 10 * 86400000);
      const pm = await prisma.payment.create({
        data: {
          firmId: acmeFirm.id,
          invoiceId: invoice.id,
          amount: amountPaid,
          currency: 'GBP',
          paymentDate: pDate,
          method: 'BANK_TRANSFER',
          reference: `TRX-${cfg.num}`,
          status: PaymentStatus.SUCCEEDED,
          provider: 'INTERNAL',
          providerTxId: `INT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        },
      });
      payments.push(pm);
    }
  }

  console.log(`✅ Created ${invoices.length} invoices and ${payments.length} customer payment transactions.`);

  // 15+ Expenses
  const expenseData = [
    { suppIdx: 0, cat: 'Software', desc: 'Monthly AWS Cloud Infrastructure', daysAgo: 75, amount: 2400, vatRate: 20 },
    { suppIdx: 1, cat: 'Utilities', desc: 'Fiber Broadband & Telephony', daysAgo: 70, amount: 350, vatRate: 20 },
    { suppIdx: 2, cat: 'Utilities', desc: 'Commercial Electricity & Heating', daysAgo: 65, amount: 820, vatRate: 20 },
    { suppIdx: 3, cat: 'Office', desc: 'Monthly Dedicated Desk Leasing', daysAgo: 60, amount: 4500, vatRate: 20 },
    { suppIdx: 4, cat: 'Professional Services', desc: 'Audit & Tax Advisory Retainer', daysAgo: 55, amount: 3000, vatRate: 20 },
    { suppIdx: 5, cat: 'Equipment', desc: '3x MacBook Pro M3 Workstations', daysAgo: 50, amount: 6900, vatRate: 20 },
    { suppIdx: 6, cat: 'Equipment', desc: 'Dell 4K Monitors & USB-C Docks', daysAgo: 45, amount: 1800, vatRate: 20 },
    { suppIdx: 7, cat: 'Travel', desc: 'Client Onsite Visit Rail Tickets', daysAgo: 40, amount: 420, vatRate: 0 },
    { suppIdx: 0, cat: 'Software', desc: 'AWS Data Lake Storage S3', daysAgo: 35, amount: 1100, vatRate: 20 },
    { suppIdx: 1, cat: 'Utilities', desc: 'BT Mobile Team Fleet Subscription', daysAgo: 30, amount: 280, vatRate: 20 },
    { suppIdx: 2, cat: 'Utilities', desc: 'Octopus Office Energy Bill', daysAgo: 25, amount: 790, vatRate: 20 },
    { suppIdx: 3, cat: 'Office', desc: 'WeWork Office Space Fee', daysAgo: 20, amount: 4500, vatRate: 20 },
    { suppIdx: 4, cat: 'Professional Services', desc: 'Legal Contract Review', daysAgo: 15, amount: 1500, vatRate: 20 },
    { suppIdx: 5, cat: 'Marketing', desc: 'Digital Marketing & Ads', daysAgo: 10, amount: 2200, vatRate: 20 },
    { suppIdx: 7, cat: 'Travel', desc: 'Executive Travel to Manchester', daysAgo: 5, amount: 310, vatRate: 0 },
  ];

  const expenses = [];
  for (const exp of expenseData) {
    const supplier = suppliers[exp.suppIdx];
    const date = new Date(now.getTime() - exp.daysAgo * 86400000);
    const vatRate = exp.vatRate;
    const amount = exp.amount;
    const vatAmount = Math.round((amount * (vatRate / 100)) * 100) / 100;
    const total = amount + vatAmount;

    const e = await prisma.expense.create({
      data: {
        firmId: acmeFirm.id,
        supplierId: supplier ? supplier.id : null,
        category: exp.cat,
        description: exp.desc,
        date,
        amount,
        vatRate,
        vatAmount,
        total,
        paymentStatus: ExpensePaymentStatus.PAID,
      },
    });
    expenses.push(e);
  }
  console.log(`✅ Created ${expenses.length} expense entries.`);

  // VAT Obligations (Multiple Quarters)
  const vatObligations = [
    { start: new Date('2025-10-01'), end: new Date('2025-12-31'), due: new Date('2026-02-07'), status: VatObligationStatus.FULFILLED, periodKey: '25C4' },
    { start: new Date('2026-01-01'), end: new Date('2026-03-31'), due: new Date('2026-05-07'), status: VatObligationStatus.FULFILLED, periodKey: '26C1' },
    { start: new Date('2026-04-01'), end: new Date('2026-06-30'), due: new Date('2026-08-07'), status: VatObligationStatus.OPEN, periodKey: '26C2' },
    { start: new Date('2026-07-01'), end: new Date('2026-09-30'), due: new Date('2026-11-07'), status: VatObligationStatus.OPEN, periodKey: '26C3' },
  ];

  for (const ob of vatObligations) {
    await prisma.vatObligation.create({
      data: {
        firmId: acmeFirm.id,
        startPeriod: ob.start,
        endPeriod: ob.end,
        dueDate: ob.due,
        status: ob.status,
        periodKey: ob.periodKey,
      },
    });
  }

  // Demo VAT Returns (Historical & Current)
  await prisma.vatReturn.create({
    data: {
      firmId: acmeFirm.id,
      periodKey: '25C4',
      startPeriod: new Date('2025-10-01'),
      endPeriod: new Date('2025-12-31'),
      box1: 14200.00,
      box2: 0.00,
      box3: 14200.00,
      box4: 4850.00,
      box5: 9350.00,
      box6: 71000.00,
      box7: 24250.00,
      box8: 0.00,
      box9: 0.00,
      status: VatReturnStatus.SUBMITTED,
      submittedAt: new Date('2026-02-01'),
      hmrcCorrelationId: 'HMRC-SUB-2026-889922',
    },
  });

  await prisma.vatReturn.create({
    data: {
      firmId: acmeFirm.id,
      periodKey: '26C1',
      startPeriod: new Date('2026-01-01'),
      endPeriod: new Date('2026-03-31'),
      box1: 18450.00,
      box2: 0.00,
      box3: 18450.00,
      box4: 5120.00,
      box5: 13330.00,
      box6: 92250.00,
      box7: 25600.00,
      box8: 0.00,
      box9: 0.00,
      status: VatReturnStatus.SUBMITTED,
      submittedAt: new Date('2026-04-28'),
      hmrcCorrelationId: 'HMRC-SUB-2026-993311',
    },
  });

  console.log('✅ Created HMRC VAT Obligations and historical VAT Returns.');

  // Integrations Connections
  await prisma.hmrcConnection.create({
    data: {
      firmId: acmeFirm.id,
      vrn: '987654321',
      isConnected: true,
      accessToken: 'mock_hmrc_access_token_xyz123',
      refreshToken: 'mock_hmrc_refresh_token_abc789',
      expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
      scope: 'read:vat write:vat',
      lastSyncAt: new Date(),
      environment: 'sandbox',
    },
  });

  await prisma.xeroConnection.create({
    data: {
      firmId: acmeFirm.id,
      tenantId: 'xero-tenant-acme-consulting-uuid',
      tenantName: 'Acme Consulting Ltd (Xero Org)',
      isConnected: true,
      accessToken: 'mock_xero_access_token_demo',
      refreshToken: 'mock_xero_refresh_token_demo',
      expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
      lastSyncAt: new Date(),
      environment: 'demo',
    },
  });

  console.log('✅ Configured HMRC and Xero integrations in sandbox/demo mode.');

  // Seed Audit Logs
  const auditEntries = [
    { userId: adminUser.id, action: 'USER_LOGIN', entity: 'User', entityId: adminUser.id, metadata: 'Log in from IP 192.168.1.1' },
    { userId: adminUser.id, action: 'HMRC_CONNECTED', entity: 'HmrcConnection', entityId: acmeFirm.id, metadata: 'Connected to HMRC Sandbox MTD API' },
    { userId: accountantUser.id, action: 'VAT_RETURN_SUBMITTED', entity: 'VatReturn', entityId: '26C1', metadata: 'Submitted 26C1 VAT Return to HMRC' },
    { userId: adminUser.id, action: 'XERO_SYNC_COMPLETED', entity: 'XeroConnection', entityId: acmeFirm.id, metadata: 'Synchronized 10 contacts and 20 invoices from Xero' },
  ];

  for (const log of auditEntries) {
    await prisma.auditLog.create({
      data: {
        firmId: acmeFirm.id,
        userId: log.userId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: '192.168.1.1',
      },
    });
  }

  console.log('✅ Created initial Audit Log records.');
  console.log('🎉 Finora V1 Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
