import prisma from '../../config/db';
import Decimal from 'decimal.js';

export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
}

export class ReportsService {
  static async getDashboard(firmId: string) {
    const now = new Date();

    // Invoices summary
    const invoices = await prisma.invoice.findMany({
      where: { firmId, status: { not: 'CANCELLED' } },
      include: { customer: true },
    });

    let totalRevenue = new Decimal(0);
    let totalOutstanding = new Decimal(0);
    let totalOverdue = new Decimal(0);
    let overdueCount = 0;
    let unpaidCount = 0;

    const overdueList: any[] = [];

    for (const inv of invoices) {
      totalRevenue = totalRevenue.plus(inv.total);
      const bal = new Decimal(inv.balanceDue);

      if (bal.greaterThan(0)) {
        unpaidCount++;
        totalOutstanding = totalOutstanding.plus(bal);

        if (new Date(inv.dueDate) < now) {
          overdueCount++;
          totalOverdue = totalOverdue.plus(bal);
          overdueList.push({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer.name,
            amount: inv.total.toString(),
            balanceDue: inv.balanceDue.toString(),
            dueDate: inv.dueDate,
          });
        }
      }
    }

    // Expenses summary
    const expenses = await prisma.expense.findMany({
      where: { firmId },
    });

    let totalExpenses = new Decimal(0);
    let totalInputVat = new Decimal(0);

    for (const exp of expenses) {
      totalExpenses = totalExpenses.plus(exp.total);
      totalInputVat = totalInputVat.plus(exp.vatAmount);
    }

    // VAT Liability
    let totalOutputVat = new Decimal(0);
    for (const inv of invoices) {
      totalOutputVat = totalOutputVat.plus(inv.vatTotal);
    }
    const estimatedVatLiability = totalOutputVat.minus(totalInputVat);

    // Payments collected
    const payments = await prisma.payment.findMany({
      where: { firmId, status: 'SUCCEEDED' },
      orderBy: { paymentDate: 'desc' },
      take: 10,
    });

    const totalCashCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Attention Required Items
    const attentionItems: Array<{ id: string; type: string; title: string; message: string; severity: 'warning' | 'error' | 'info' }> = [];

    if (overdueCount > 0) {
      attentionItems.push({
        id: 'att-overdue',
        type: 'OVERDUE_INVOICES',
        title: `${overdueCount} Overdue Invoice${overdueCount > 1 ? 's' : ''}`,
        message: `Totaling £${totalOverdue.toFixed(2)} requiring follow up`,
        severity: 'error',
      });
    }

    // HMRC connection check
    const hmrcConn = await prisma.hmrcConnection.findUnique({ where: { firmId } });
    if (!hmrcConn || !hmrcConn.isConnected) {
      attentionItems.push({
        id: 'att-hmrc',
        type: 'HMRC_DISCONNECTED',
        title: 'HMRC Connection Disconnected',
        message: 'Re-authenticate with HMRC MTD to submit VAT returns',
        severity: 'warning',
      });
    }

    // VAT Deadline check
    const nextObligation = await prisma.vatObligation.findFirst({
      where: { firmId, status: 'OPEN' },
      orderBy: { dueDate: 'asc' },
    });

    if (nextObligation) {
      attentionItems.push({
        id: 'att-vat-due',
        type: 'VAT_DEADLINE',
        title: `VAT Return Due (${nextObligation.periodKey})`,
        message: `Submission deadline: ${new Date(nextObligation.dueDate).toLocaleDateString('en-GB')}`,
        severity: 'info',
      });
    }

    // Xero Sync Check
    const xeroConn = await prisma.xeroConnection.findUnique({ where: { firmId } });
    if (!xeroConn || !xeroConn.isConnected) {
      attentionItems.push({
        id: 'att-xero',
        type: 'XERO_DISCONNECTED',
        title: 'Xero Synchronization Inactive',
        message: 'Connect Xero to keep accounting data in sync',
        severity: 'info',
      });
    }

    // Recent Activity timeline
    const recentAuditLogs = await prisma.auditLog.findMany({
      where: { firmId },
      include: { user: { select: { name: true } } },
      orderBy: { timestamp: 'desc' },
      take: 8,
    });

    // Monthly Financial Overview Trend (Last 6 Months)
    const monthlyTrend: Array<{ month: string; revenue: number; expenses: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });

      const monthInvoices = invoices.filter((inv) => {
        const idate = new Date(inv.issueDate);
        return idate >= d && idate <= monthEnd;
      });

      const monthExpenses = expenses.filter((exp) => {
        const edate = new Date(exp.date);
        return edate >= d && edate <= monthEnd;
      });

      const rev = monthInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
      const exp = monthExpenses.reduce((sum, e) => sum + Number(e.total), 0);

      monthlyTrend.push({
        month: monthLabel,
        revenue: Math.round(rev),
        expenses: Math.round(exp),
      });
    }

    return {
      kpis: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOutstanding: totalOutstanding.toFixed(2),
        totalOverdue: totalOverdue.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        estimatedVatLiability: estimatedVatLiability.toFixed(2),
        totalCashCollected: totalCashCollected.toFixed(2),
        invoiceCount: invoices.length,
        unpaidCount,
        overdueCount,
      },
      attentionItems,
      overdueInvoices: overdueList,
      monthlyTrend,
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        user: log.user?.name || 'System',
        description: log.metadata || `${log.action} on ${log.entity}`,
        timestamp: log.timestamp,
      })),
    };
  }

  static async getRevenueReport(firmId: string, filter?: ReportFilterDto) {
    const whereClause: any = { firmId, status: { not: 'CANCELLED' } };

    if (filter?.startDate || filter?.endDate) {
      whereClause.issueDate = {};
      if (filter.startDate) whereClause.issueDate.gte = new Date(filter.startDate);
      if (filter.endDate) whereClause.issueDate.lte = new Date(filter.endDate);
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { customer: true },
      orderBy: { issueDate: 'desc' },
    });

    const totalSubtotal = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const totalVat = invoices.reduce((sum, inv) => sum + Number(inv.vatTotal), 0);
    const totalGross = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid), 0);

    return {
      summary: {
        totalSubtotal: totalSubtotal.toFixed(2),
        totalVat: totalVat.toFixed(2),
        totalGross: totalGross.toFixed(2),
        totalCollected: totalCollected.toFixed(2),
        invoiceCount: invoices.length,
      },
      invoices,
    };
  }

  static async getExpenseReport(firmId: string, filter?: ReportFilterDto) {
    const whereClause: any = { firmId };

    if (filter?.startDate || filter?.endDate) {
      whereClause.date = {};
      if (filter.startDate) whereClause.date.gte = new Date(filter.startDate);
      if (filter.endDate) whereClause.date.lte = new Date(filter.endDate);
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: { supplier: true },
      orderBy: { date: 'desc' },
    });

    const totalNet = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalVat = expenses.reduce((sum, e) => sum + Number(e.vatAmount), 0);
    const totalGross = expenses.reduce((sum, e) => sum + Number(e.total), 0);

    // Group by category
    const categoryMap: Record<string, number> = {};
    for (const exp of expenses) {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + Number(exp.total);
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: amount.toFixed(2),
    }));

    return {
      summary: {
        totalNet: totalNet.toFixed(2),
        totalVat: totalVat.toFixed(2),
        totalGross: totalGross.toFixed(2),
        expenseCount: expenses.length,
      },
      categoryBreakdown,
      expenses,
    };
  }
}
