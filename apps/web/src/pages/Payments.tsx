import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { CreditCard, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const res = await apiFetch('/payments');
    if (res.success && res.data) {
      setPayments(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Ledger & Abstraction</h2>
          <p className="text-xs text-slate-500 mt-0.5">Recorded customer receipts and provider transaction history</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading payment transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No payment transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Invoice / Customer</th>
                  <th className="py-3 px-4">Method & Reference</th>
                  <th className="py-3 px-4">Provider / Tx ID</th>
                  <th className="py-3 px-4 text-right">Amount (£)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      {p.invoice ? (
                        <div>
                          <Link to={`/invoices/${p.invoice.id}`} className="font-bold text-blue-600 hover:underline">
                            {p.invoice.invoiceNumber}
                          </Link>
                          <span className="text-[11px] text-slate-500 block">{p.invoice.customer?.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Direct Entry / Expense</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{p.method}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.reference || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {p.provider}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{p.providerTxId}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      £{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {p.status}
                      </span>
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
