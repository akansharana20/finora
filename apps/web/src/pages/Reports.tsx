import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { BarChart3, TrendingUp, Wallet, Receipt, Calendar, Percent, CreditCard, Clock, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Reports: React.FC = () => {
  const { activeFirmId, activeFirmName } = useAuth();
  const [activeTab, setActiveTab] = useState<'revenue' | 'expense' | 'vat' | 'outstanding' | 'payments'>('revenue');
  const [revenueData, setRevenueData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const [vatData, setVatData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate, activeFirmId]);

  const fetchReportData = async () => {
    setLoading(true);
    let params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    const query = params.length ? `?${params.join('&')}` : '';

    if (activeTab === 'revenue') {
      const res = await apiFetch(`/reports/revenue${query}`);
      if (res.success) setRevenueData(res.data);
    } else if (activeTab === 'expense') {
      const res = await apiFetch(`/reports/expense${query}`);
      if (res.success) setExpenseData(res.data);
    } else if (activeTab === 'vat') {
      const res = await apiFetch(`/reports/vat${query}`);
      if (res.success) setVatData(res.data);
    } else if (activeTab === 'outstanding') {
      const res = await apiFetch('/invoices');
      if (res.success) {
        const unpaid = (res.data || []).filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED');
        setInvoices(unpaid);
      }
    } else if (activeTab === 'payments') {
      const res = await apiFetch('/payments');
      if (res.success) setPayments(res.data || []);
    }
    setLoading(false);
  };

  const totalOutstandingBal = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
  const now = new Date();
  const totalOverdueBal = invoices
    .filter((i) => new Date(i.dueDate) < now)
    .reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

  const totalPaymentsAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Reports & Analytics</h2>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Building size={11} />
              <span>{activeFirmName || 'Acme Consulting Ltd'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real transactional aggregation of revenue, expenses, VAT position and payment history
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1 border border-slate-300 rounded outline-none"
            title="Start Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-1 border border-slate-300 rounded outline-none"
            title="End Date"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-blue-600 hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'revenue'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Revenue & Invoicing
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'expense'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Expense Breakdown
        </button>
        <button
          onClick={() => setActiveTab('vat')}
          className={`px-4 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'vat'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          VAT & Tax Position
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`px-4 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'outstanding'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Outstanding Invoices
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-t-lg transition-colors shrink-0 ${
            activeTab === 'payments'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Payment Ledger
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
                  <span className="text-xl font-bold text-slate-900">£{revenueData.summary.totalSubtotal || (Number(revenueData.summary.totalRevenue) * 0.833).toFixed(2)}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">VAT Output Collected</span>
                  <span className="text-xl font-bold text-blue-600">£{revenueData.summary.totalVat}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Gross Revenue</span>
                  <span className="text-xl font-bold text-emerald-600">£{revenueData.summary.totalGross || revenueData.summary.totalRevenue}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Invoices Count</span>
                  <span className="text-xl font-bold text-slate-900">{revenueData.summary.invoiceCount}</span>
                </div>
              </div>

              {/* Invoices Detailed Table */}
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
                      {(revenueData.invoices || []).map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-blue-600">
                            <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{inv.customerName || inv.customer?.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {new Date(inv.issueDate).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">£{Number(inv.subtotal).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">£{Number(inv.vatTotal).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">£{Number(inv.total).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">£{Number(inv.amountPaid || 0).toFixed(2)}</td>
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
                  <span className="text-xl font-bold text-slate-900">£{expenseData.summary.totalNet || expenseData.summary.totalExpenses}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Reclaimable Input VAT</span>
                  <span className="text-xl font-bold text-blue-600">£{expenseData.summary.totalVat || expenseData.summary.totalVatReclaimed}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Total Gross Expense</span>
                  <span className="text-xl font-bold text-slate-900">£{expenseData.summary.totalGross || expenseData.summary.totalExpenses}</span>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Expense Category Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {(expenseData.categoryBreakdown || []).map((cat: any, idx: number) => (
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

      {/* VAT REPORT TAB */}
      {activeTab === 'vat' && (
        <div className="space-y-6">
          {loading || !vatData ? (
            <div className="p-8 text-center text-slate-500 text-xs">Calculating VAT positions...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Output VAT (Sales)</span>
                  <span className="text-xl font-bold text-slate-900">£{vatData.summary.outputVat}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Input VAT (Purchases)</span>
                  <span className="text-xl font-bold text-slate-900">£{vatData.summary.inputVat}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-400 font-medium block mb-1">Net VAT Liability</span>
                  <span className="text-xl font-bold text-blue-600">£{vatData.summary.netVatLiability}</span>
                </div>
              </div>

              {/* Rate Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  VAT Rate Analysis
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {(vatData.rateBreakdown || []).map((rb: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700 block">{rb.rate}</span>
                      <span className="text-lg font-bold text-slate-900 mt-1 block">£{rb.amount}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{rb.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
                  Recent VAT Transactions Included
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Contact</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Net</th>
                        <th className="py-2 px-3 text-right">VAT</th>
                        <th className="py-2 px-3 text-right">Gross</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(vatData.recentTransactions || []).map((tx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tx.type === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{tx.reference}</td>
                          <td className="py-2 px-3 text-slate-600">{tx.contact}</td>
                          <td className="py-2 px-3 text-slate-500">{new Date(tx.date).toLocaleDateString('en-GB')}</td>
                          <td className="py-2 px-3 text-right text-slate-700">£{Number(tx.net).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-medium text-blue-600">£{Number(tx.vat).toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">£{Number(tx.gross).toFixed(2)}</td>
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

      {/* OUTSTANDING INVOICES TAB */}
      {activeTab === 'outstanding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block mb-1">Total Outstanding Balance</span>
              <span className="text-xl font-bold text-amber-600">£{totalOutstandingBal.toFixed(2)}</span>
              <span className="text-[11px] text-slate-400 mt-1 block">{invoices.length} unpaid invoices</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block mb-1">Total Overdue Balance</span>
              <span className="text-xl font-bold text-red-600">£{totalOverdueBal.toFixed(2)}</span>
              <span className="text-[11px] text-red-500 mt-1 block">Requiring customer follow-up</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Outstanding Receivables Aging
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => {
                    const isOverdue = new Date(inv.dueDate) < now;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-blue-600">
                          <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{inv.customerName || inv.customer?.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{new Date(inv.issueDate).toLocaleDateString('en-GB')}</td>
                        <td className={`py-2.5 px-3 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                          {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">£{Number(inv.total).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">£{Number(inv.balanceDue).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOverdue ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isOverdue ? 'OVERDUE' : inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT RECONCILIATION TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block mb-1">Total Cash Receipts Recorded</span>
              <span className="text-xl font-bold text-emerald-600">£{totalPaymentsAmount.toFixed(2)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-medium block mb-1">Total Transaction Entries</span>
              <span className="text-xl font-bold text-slate-900">{payments.length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Payment Transactions Reconciliation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Invoice / Counterparty</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3 text-right">Amount (£)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-600">{new Date(p.paymentDate).toLocaleDateString('en-GB')}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {p.invoiceNumber || p.invoice?.invoiceNumber || p.customerName || 'Direct'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.method?.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{p.reference || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">£{Number(p.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {p.status || 'CONFIRMED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
