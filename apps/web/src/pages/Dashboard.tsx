import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import {
  TrendingUp,
  AlertTriangle,
  Receipt,
  Wallet,
  Percent,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await apiFetch('/reports/dashboard');
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error?.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const {
    kpis = {},
    attentionItems = [],
    overdueInvoices = [],
    monthlyTrend = [],
    recentActivity = [],
  } = data || {};

  // Max value for simple SVG chart scale
  const maxVal = Math.max(
    ...(monthlyTrend || []).map((m: any) => Math.max(m.revenue || 0, m.expenses || 0)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Financial Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live business performance, VAT liability & operational alerts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/invoices/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-xs"
          >
            + Create Invoice
          </Link>
          <Link
            to="/expenses"
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors"
          >
            + Record Expense
          </Link>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Revenue</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">£{Number(kpis.totalRevenue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
            <span>{kpis.invoiceCount} invoices issued</span>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Outstanding</span>
            <Receipt size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600">£{Number(kpis.totalOutstanding).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {kpis.unpaidCount} unpaid invoices
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Overdue</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-600">£{Number(kpis.totalOverdue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">
            {kpis.overdueCount} require action
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Expenses</span>
            <Wallet size={16} className="text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">£{Number(kpis.totalExpenses).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Operating costs</div>
        </div>

        {/* Estimated VAT Liability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Est. VAT Liability</span>
            <Percent size={16} className="text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-600">£{Number(kpis.estimatedVatLiability).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Net payable to HMRC</div>
        </div>

        {/* Total Cash Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Cash Received</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">£{Number(kpis.totalCashCollected).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Bank receipts</div>
        </div>
      </div>

      {/* ATTENTION REQUIRED & FINANCIAL CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATTENTION REQUIRED CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <AlertCircle size={18} className="text-amber-500" />
                <span>Attention Required</span>
              </h3>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {attentionItems.length} items
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {attentionItems.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.severity === 'error'
                        ? 'bg-red-50 text-red-600'
                        : item.severity === 'warning'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/vat"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
            >
              <span>Manage VAT & Compliance</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* FINANCIAL OVERVIEW CHART (MONTHLY REVENUE VS EXPENSES) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Financial Performance Overview</h3>
              <p className="text-xs text-slate-500">Monthly Revenue vs Operating Expenses (GBP)</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1 text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
                <span>Revenue</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block"></span>
                <span>Expenses</span>
              </span>
            </div>
          </div>

          {/* Simple Clean Bar Chart Visualizer */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-200">
            {monthlyTrend.map((m: any, idx: number) => {
              const revHeight = Math.round((m.revenue / maxVal) * 100);
              const expHeight = Math.round((m.expenses / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 bg-blue-600 hover:bg-blue-700 rounded-t transition-all relative"
                      style={{ height: `${revHeight}%` }}
                      title={`Revenue: £${m.revenue.toLocaleString()}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 bg-slate-300 hover:bg-slate-400 rounded-t transition-all relative"
                      style={{ height: `${expHeight}%` }}
                      title={`Expenses: £${m.expenses.toLocaleString()}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-2">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* OVERDUE INVOICES & RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OVERDUE INVOICES */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Overdue Invoices Needing Action</h3>
            <Link to="/invoices?status=OVERDUE" className="text-xs text-blue-600 hover:underline font-medium">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueInvoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-blue-600">
                      <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-2.5 font-medium text-slate-800">{inv.customerName}</td>
                    <td className="py-2.5 text-red-600 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      £{Number(inv.balanceDue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT ACTIVITY TIMELINE */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Accounting Activity</h3>
            <span className="text-xs text-slate-400">Audit trail</span>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 6).map((log: any) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-slate-800 font-medium">{log.description}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    {typeof log.user === 'object' ? log.user?.name || log.user?.email || 'System' : (log.user || 'System')} • {new Date(log.timestamp).toLocaleString('en-GB')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
