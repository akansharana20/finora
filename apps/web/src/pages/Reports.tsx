import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { BarChart3, TrendingUp, Wallet, Receipt, Calendar, Download } from 'lucide-react';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expense'>('revenue');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    let params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    const query = params.length ? `?${params.join('&')}` : '';

    if (activeTab === 'revenue') {
      const res = await apiFetch(`/reports/revenue${query}`);
      if (res.success) setRevenueData(res.data);
    } else {
      const res = await apiFetch(`/reports/expense${query}`);
      if (res.success) setExpenseData(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Reports & Auditing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real database aggregation of revenue, expenses and tax breakdowns</p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1 border border-slate-300 rounded outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-1 border border-slate-300 rounded outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'revenue'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Revenue & Invoicing Report
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'expense'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Operating Expense Breakdown
        </button>
      </div>

      {/* REVENUE REPORT TAB */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {loading || !revenueData ? (
            <div className="p-8 text-center text-slate-500 text-xs">Generating revenue report...</div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Net Subtotal</span>
                  <span className="text-xl font-bold text-slate-900">£{revenueData.summary.totalSubtotal}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">VAT Output Collected</span>
                  <span className="text-xl font-bold text-blue-600">£{revenueData.summary.totalVat}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Gross Revenue</span>
                  <span className="text-xl font-bold text-emerald-600">£{revenueData.summary.totalGross}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Cash Collected</span>
                  <span className="text-xl font-bold text-slate-900">£{revenueData.summary.totalCollected}</span>
                </div>
              </div>

              {/* Invoices Detailed Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Revenue Invoices Included ({revenueData.summary.invoiceCount})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Issue Date</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                        <th className="py-2.5 px-3 text-right">VAT</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-right">Collected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {revenueData.invoices.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-blue-600">{inv.invoiceNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{inv.customer?.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {new Date(inv.issueDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">£{Number(inv.subtotal).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">£{Number(inv.vatTotal).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">£{Number(inv.total).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">£{Number(inv.amountPaid).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* EXPENSE REPORT TAB */}
      {activeTab === 'expense' && (
        <div className="space-y-6">
          {loading || !expenseData ? (
            <div className="p-8 text-center text-slate-500 text-xs">Generating expense report...</div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Net Expense</span>
                  <span className="text-xl font-bold text-slate-900">£{expenseData.summary.totalNet}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Reclaimable Input VAT</span>
                  <span className="text-xl font-bold text-blue-600">£{expenseData.summary.totalVat}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Gross Expense</span>
                  <span className="text-xl font-bold text-slate-900">£{expenseData.summary.totalGross}</span>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Expense Category Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {expenseData.categoryBreakdown.map((cat: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-600 block">{cat.category}</span>
                      <span className="text-base font-bold text-slate-900 mt-1 block">£{cat.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
