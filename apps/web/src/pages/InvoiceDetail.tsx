import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { ArrowLeft, CreditCard, Send, CheckCircle2, XCircle, Printer, AlertCircle, X } from 'lucide-react';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    if (id) {
      setLoading(true);
      const res = await apiFetch(`/invoices/${id}`);
      if (res.success && res.data) {
        setInvoice(res.data);
        setPaymentAmount(Number(res.data.balanceDue));
        setPaymentRef(`TRX-${res.data.invoiceNumber}`);
      }
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    const res = await apiFetch(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      fetchInvoice();
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify({
        invoiceId: id,
        amount: Number(paymentAmount),
        method: paymentMethod,
        reference: paymentRef,
      }),
    });

    if (res.success) {
      setShowPaymentModal(false);
      fetchInvoice();
    } else {
      setPaymentError(res.error?.message || 'Failed to record payment');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-xs">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500 text-xs">Invoice not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/invoices" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline">
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {invoice.status === 'DRAFT' && (
            <button
              onClick={() => handleUpdateStatus('SENT')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded text-xs inline-flex items-center space-x-1"
            >
              <Send size={14} />
              <span>Mark as Sent</span>
            </button>
          )}

          {Number(invoice.balanceDue) > 0 && invoice.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded text-xs inline-flex items-center space-x-1 shadow-xs"
            >
              <CreditCard size={14} />
              <span>Record Payment</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded text-xs inline-flex items-center space-x-1"
          >
            <Printer size={14} />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* TOP PRIORITY INVOICE HIGHLIGHT HEADER (Requirement 26) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Invoice Number</span>
          <span className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Customer</span>
          <span className="text-base font-bold text-slate-800 block truncate">
            {invoice.customer?.name}
          </span>
          {invoice.customer?.companyName && (
            <span className="text-xs text-slate-500 block truncate">{invoice.customer.companyName}</span>
          )}
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Status</span>
          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
              invoice.status === 'PAID'
                ? 'bg-emerald-100 text-emerald-800'
                : invoice.status === 'OVERDUE'
                ? 'bg-red-100 text-red-800'
                : invoice.status === 'PARTIALLY_PAID'
                ? 'bg-amber-100 text-amber-800'
                : invoice.status === 'SENT'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {invoice.status}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-slate-400 block mb-1">Total Amount</span>
          <span className="text-2xl font-bold text-blue-600">£{Number(invoice.total).toFixed(2)}</span>
          <span className="text-xs text-amber-600 font-bold block mt-0.5">
            Balance Due: £{Number(invoice.balanceDue).toFixed(2)}
          </span>
        </div>
      </div>

      {/* INVOICE DOCUMENT BODY */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Invoice Metadata Header */}
        <div className="flex justify-between border-b border-slate-100 pb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Billed To:</h3>
            <p className="text-xs font-semibold text-slate-800 mt-1">{invoice.customer?.name}</p>
            {invoice.customer?.companyName && <p className="text-xs text-slate-500">{invoice.customer.companyName}</p>}
            {invoice.customer?.address && <p className="text-xs text-slate-500">{invoice.customer.address}</p>}
            {invoice.customer?.postcode && <p className="text-xs text-slate-500">{invoice.customer.postcode}</p>}
            {invoice.customer?.vatNumber && <p className="text-xs text-slate-500 mt-1">VAT: {invoice.customer.vatNumber}</p>}
          </div>

          <div className="text-right text-xs space-y-1">
            <div><span className="text-slate-400">Issue Date:</span> <strong className="text-slate-800">{new Date(invoice.issueDate).toLocaleDateString('en-GB')}</strong></div>
            <div><span className="text-slate-400">Due Date:</span> <strong className="text-slate-800">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</strong></div>
            <div><span className="text-slate-400">Currency:</span> <strong className="text-slate-800">GBP (£)</strong></div>
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">VAT Rate</th>
                <th className="py-2.5 px-3 text-right">VAT Amount</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-3 px-3 font-medium text-slate-800">{item.description}</td>
                  <td className="py-3 px-3 text-center text-slate-600">{Number(item.quantity)}</td>
                  <td className="py-3 px-3 text-right text-slate-600">£{Number(item.unitPrice).toFixed(2)}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{Number(item.vatRate)}%</td>
                  <td className="py-3 px-3 text-right text-slate-600">£{Number(item.vatAmount).toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">£{Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-64 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal (excl. VAT):</span>
              <span className="font-semibold text-slate-900">£{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT Amount:</span>
              <span className="font-semibold text-slate-900">£{Number(invoice.vatTotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Invoice:</span>
              <span className="text-blue-600">£{Number(invoice.total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Amount Paid:</span>
              <span className="text-emerald-600">£{Number(invoice.amountPaid).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-amber-700 pt-1 border-t border-slate-100">
              <span>Balance Due:</span>
              <span>£{Number(invoice.balanceDue).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-700 block mb-1">Notes & Terms:</span>
            <p>{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payments Received History */}
      {invoice.payments?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Payments Recorded for this Invoice</h4>
          <div className="divide-y divide-slate-100 text-xs">
            {invoice.payments.map((p: any) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">£{Number(p.amount).toFixed(2)} — {p.method}</div>
                  <div className="text-[11px] text-slate-400">Ref: {p.reference} • {new Date(p.paymentDate).toLocaleDateString('en-GB')}</div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Record Customer Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {paymentError && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{paymentError}</div>}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (£) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={Number(invoice.balanceDue)}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-sm outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (BACS / Faster Payments)</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="DIRECT_DEBIT">Direct Debit</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-xs"
                >
                  Confirm & Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
