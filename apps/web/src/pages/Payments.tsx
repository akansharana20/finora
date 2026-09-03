import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { CreditCard, CheckCircle2, AlertCircle, Plus, X, ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Payments: React.FC = () => {
  const { user, activeFirmId } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'BANK_TRANSFER',
    reference: '',
    contactName: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, [activeFirmId]);

  const fetchPayments = async () => {
    setLoading(true);
    const res = await apiFetch('/payments');
    if (res.success && res.data) {
      setPayments(res.data);
    }
    setLoading(false);
  };

  const fetchInvoices = async () => {
    const res = await apiFetch('/invoices');
    if (res.success && res.data) {
      // Filter unpaid or partially paid invoices for the dropdown
      setInvoices(res.data);
    }
  };

  const handleOpenModal = () => {
    setError(null);
    setSuccessMessage(null);
    const firstUnpaid = invoices.find((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');
    setFormData({
      invoiceId: firstUnpaid?.id || '',
      amount: firstUnpaid ? String(firstUnpaid.balanceDue) : '100.00',
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'BANK_TRANSFER',
      reference: `TRX-${Date.now().toString().slice(-6)}`,
      contactName: firstUnpaid?.customerName || '',
    });
    setShowModal(true);
  };

  const handleInvoiceChange = (invId: string) => {
    const inv = invoices.find((i) => i.id === invId);
    setFormData({
      ...formData,
      invoiceId: invId,
      amount: inv ? String(inv.balanceDue) : formData.amount,
      contactName: inv ? (inv.customerName || inv.customer?.name || '') : formData.contactName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid payment amount greater than zero');
      return;
    }

    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: formData.invoiceId || undefined,
        amount: amountNum,
        paymentDate: formData.paymentDate,
        method: formData.method,
        reference: formData.reference,
        contactName: formData.contactName,
      }),
    });

    if (res.success) {
      setSuccessMessage(`Payment of £${amountNum.toFixed(2)} recorded successfully.`);
      setShowModal(false);
      fetchPayments();
      fetchInvoices();
    } else {
      setError(res.error?.message || 'Failed to record payment');
    }
  };

  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Bank Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Recorded customer receipts, disbursements and bank transactions</p>
        </div>

        {user?.role !== 'USER' && (
          <button
            onClick={handleOpenModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>Record Payment</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Payment Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading payment transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No payment transactions recorded for this company yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Invoice / Counterparty</th>
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
                          <span className="text-[11px] text-slate-500 block">
                            {p.invoice.customer?.name || p.customerName}
                          </span>
                        </div>
                      ) : p.invoiceNumber ? (
                        <div>
                          <span className="font-bold text-slate-800">{p.invoiceNumber}</span>
                          <span className="text-[11px] text-slate-500 block">{p.customerName || 'Customer'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-medium">{p.customerName || 'Direct Payment'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{p.method?.replace('_', ' ') || 'BANK TRANSFER'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.reference || '—'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {p.provider || 'INTERNAL'}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {p.providerTxId || p.id}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      £{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {p.status || 'CONFIRMED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="text-blue-600" size={18} />
                <h3 className="font-bold text-sm text-slate-900">Record Payment Received</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Apply to Invoice</label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="">-- Direct Payment (No Invoice) --</option>
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName || inv.customer?.name} (Balance: £
                      {Number(inv.balanceDue).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Counterparty Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. Apex Retail Group Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount Received (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (BACS/Faster)</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="DIRECT_DEBIT">Direct Debit</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / Transaction ID</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    placeholder="e.g. BACS-9842"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
