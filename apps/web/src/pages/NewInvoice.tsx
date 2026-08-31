import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Calculator } from 'lucide-react';

export const NewInvoice: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const initialCustomer = searchParams.get('customerId') || '';
  const navigate = useNavigate();

  const [customerId, setCustomerId] = useState(initialCustomer);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('Standard payment terms: 30 days net. Thank you for your business.');
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState([
    { description: 'Professional Consulting Services', quantity: 1, unitPrice: 1000, vatRate: 20 },
  ]);

  useEffect(() => {
    apiFetch('/customers').then((res) => {
      if (res.success && res.data) {
        setCustomers(res.data);
        if (!customerId && res.data.length > 0) {
          setCustomerId(res.data[0].id);
        }
      }
    });
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 20 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // Live client-side preview calculations
  let subtotal = 0;
  let vatTotal = 0;
  const calculated = items.map((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.vatRate) || 0;
    const lineSub = Math.round(qty * price * 100) / 100;
    const lineVat = Math.round(lineSub * (rate / 100) * 100) / 100;
    const lineTot = lineSub + lineVat;
    subtotal += lineSub;
    vatTotal += lineVat;
    return { lineSub, lineVat, lineTot };
  });
  const total = subtotal + vatTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      customerId,
      invoiceNumber,
      issueDate,
      dueDate,
      notes,
      items: items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        vatRate: Number(it.vatRate),
      })),
    };

    const res = await apiFetch('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      navigate(`/invoices/${res.data.id}`);
    } else {
      setError(res.error?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/invoices" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} />
        <span>Back to Invoices</span>
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Create New Sales Invoice</h2>
        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded">DRAFT</span>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Core Header Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.companyName ? `(${c.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Number *</label>
            <input
              type="text"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Date *</label>
            <input
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Line Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded inline-flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3 w-5/12">Description</th>
                  <th className="py-2 px-3 w-2/12">Qty</th>
                  <th className="py-2 px-3 w-2/12">Unit Price (£)</th>
                  <th className="py-2 px-3 w-2/12">VAT Rate</th>
                  <th className="py-2 px-3 text-right">Line Total</th>
                  <th className="py-2 px-3 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full p-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full p-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={item.vatRate}
                        onChange={(e) => updateItem(idx, 'vatRate', parseFloat(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value={20}>Standard (20%)</option>
                        <option value={5}>Reduced (5%)</option>
                        <option value={0}>Zero Rate (0%)</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      £{calculated[idx]?.lineTot.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-1 text-xs font-medium text-slate-600">
            <div className="flex justify-between w-64">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64">
              <span>VAT Total (20%):</span>
              <span className="font-semibold text-slate-900">£{vatTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
              <span>Total Invoice Amount:</span>
              <span className="text-blue-600">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Submit */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Notes / Terms</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Link
              to="/invoices"
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs flex items-center space-x-1.5"
            >
              <Save size={16} />
              <span>Save & Issue Invoice</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
