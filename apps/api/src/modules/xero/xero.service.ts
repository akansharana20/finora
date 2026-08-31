import prisma from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { XeroClient } from './xero.client';
import { CustomerStatus, InvoiceStatus } from '@prisma/client';

export class XeroService {
  private static client = new XeroClient();

  static async getConnectUrl(firmId: string) {
    const state = Buffer.from(JSON.stringify({ firmId, timestamp: Date.now() })).toString('base64');
    return XeroService.client.getAuthorizationUrl(state);
  }

  static async handleCallback(firmId: string, code: string) {
    const connection = await prisma.xeroConnection.upsert({
      where: { firmId },
      update: {
        tenantId: `xero-tenant-${firmId.substring(0, 8)}`,
        tenantName: `Demo Firm Organisation`,
        isConnected: true,
        accessToken: `mock_xero_token_${Date.now()}`,
        refreshToken: `mock_xero_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
        lastSyncAt: new Date(),
        environment: 'demo',
      },
      create: {
        firmId,
        tenantId: `xero-tenant-${firmId.substring(0, 8)}`,
        tenantName: `Demo Firm Organisation`,
        isConnected: true,
        accessToken: `mock_xero_token_${Date.now()}`,
        refreshToken: `mock_xero_refresh_${Date.now()}`,
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30),
        lastSyncAt: new Date(),
        environment: 'demo',
      },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'XERO_CONNECTED',
        entity: 'XeroConnection',
        entityId: connection.id,
        metadata: `Connected firm to Xero (${connection.tenantName})`,
      },
    });

    return connection;
  }

  static async getStatus(firmId: string) {
    const connection = await prisma.xeroConnection.findUnique({
      where: { firmId },
    });

    return {
      isConnected: connection?.isConnected || false,
      tenantId: connection?.tenantId || null,
      tenantName: connection?.tenantName || null,
      lastSyncAt: connection?.lastSyncAt || null,
      environment: connection?.environment || 'demo',
      isMock: process.env.INTEGRATION_MODE === 'mock' || !process.env.XERO_CLIENT_ID,
    };
  }

  static async disconnect(firmId: string) {
    const connection = await prisma.xeroConnection.findUnique({ where: { firmId } });
    if (connection) {
      await prisma.xeroConnection.update({
        where: { firmId },
        data: { isConnected: false, accessToken: null, refreshToken: null },
      });

      await prisma.auditLog.create({
        data: {
          firmId,
          action: 'XERO_DISCONNECTED',
          entity: 'XeroConnection',
          entityId: connection.id,
          metadata: `Disconnected firm from Xero`,
        },
      });
    }

    return { message: 'Disconnected from Xero successfully' };
  }

  static async sync(firmId: string) {
    const contacts = await XeroService.client.syncContacts();
    const invoices = await XeroService.client.syncInvoices();

    let createdCustomers = 0;
    let createdInvoices = 0;

    // Process Contacts into Finora Customers
    for (const c of contacts) {
      const existing = await prisma.customer.findFirst({
        where: { firmId, name: c.name },
      });

      if (!existing) {
        await prisma.customer.create({
          data: {
            firmId,
            name: c.name,
            companyName: c.name,
            email: c.emailAddress || null,
            vatNumber: c.taxNumber || null,
            status: CustomerStatus.ACTIVE,
            notes: 'Imported via Xero Sync',
          },
        });
        createdCustomers++;
      }
    }

    // Process Invoices into Finora Invoices
    for (const inv of invoices) {
      let customer = await prisma.customer.findFirst({
        where: { firmId, name: inv.contact.name },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            firmId,
            name: inv.contact.name,
            companyName: inv.contact.name,
            notes: 'Created automatically during Xero invoice sync',
          },
        });
      }

      const existingInv = await prisma.invoice.findFirst({
        where: { firmId, invoiceNumber: inv.invoiceNumber },
      });

      if (!existingInv) {
        const status = inv.status === 'PAID' ? InvoiceStatus.PAID : InvoiceStatus.SENT;
        const amountPaid = inv.status === 'PAID' ? inv.total : inv.total - inv.amountDue;

        await prisma.invoice.create({
          data: {
            firmId,
            customerId: customer.id,
            invoiceNumber: inv.invoiceNumber,
            issueDate: new Date(inv.date),
            dueDate: new Date(inv.dueDate),
            status,
            subtotal: inv.subTotal,
            vatTotal: inv.totalTax,
            total: inv.total,
            amountPaid,
            balanceDue: inv.amountDue,
            notes: 'Imported from Xero Accounting',
            items: {
              create: [
                {
                  description: 'Xero Line Item Sync',
                  quantity: 1,
                  unitPrice: inv.subTotal,
                  vatRate: 20.0,
                  vatAmount: inv.totalTax,
                  total: inv.total,
                },
              ],
            },
          },
        });
        createdInvoices++;
      }
    }

    await prisma.xeroConnection.update({
      where: { firmId },
      data: { lastSyncAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        firmId,
        action: 'XERO_SYNC_COMPLETED',
        entity: 'XeroConnection',
        entityId: firmId,
        metadata: `Synchronized ${createdCustomers} customers and ${createdInvoices} invoices from Xero`,
      },
    });

    return {
      success: true,
      lastSyncAt: new Date(),
      stats: {
        contactsProcessed: contacts.length,
        invoicesProcessed: invoices.length,
        createdCustomers,
        createdInvoices,
      },
    };
  }
}
