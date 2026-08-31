import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Receipt, Filter, ArrowUpRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, search]);

  const fetchInvoices = async () => {
    setLoading(true);
    let params = [];
    if (statusFilter) params.push(`status=${statusFilter}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const queryString = params.length ? `?${params.join('&')}` : '';

    const res = await apiFetch(`/invoices${queryString}`);
    if (res.success && res.data) {
      setInvoices(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer billing, line items, VAT calculations and payments</p>
        </div>
        <Link
          to="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-xs self-start"
        >
          <Plus size={16} />
          <span>Create New Invoice</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold overflow-x-auto pb-1">
        {['', 'DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((st) => (
          <button
            key={st}
            onClick={() => {
              if (st) setSearchParams({ status: st });
              else setSearchParams({});
            }}
            className={`px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              statusFilter === st
                ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {st === '' ? 'All Invoices' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or customer name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {invoices.length} invoices
        </span>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No invoices matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">VAT</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">
                      <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {inv.customer?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.issueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800'
                            : inv.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(inv.subtotal).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(inv.vatTotal).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">£{Number(inv.total).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={Number(inv.balanceDue) > 0 ? 'text-amber-600' : 'text-slate-700'}>
                        £{Number(inv.balanceDue).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
