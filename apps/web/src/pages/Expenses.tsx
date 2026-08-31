import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Search, Plus, Wallet, Trash2, X, Filter } from 'lucide-react';

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    category: 'Software',
    description: '',
    date: new Date().toISOString().split('T')[0],
    amount: 100,
    vatRate: 20,
    paymentStatus: 'PAID',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
    fetchSuppliers();
  }, [categoryFilter, search]);

  const fetchExpenses = async () => {
    setLoading(true);
    let params = [];
    if (categoryFilter) params.push(`category=${categoryFilter}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const query = params.length ? `?${params.join('&')}` : '';

    const res = await apiFetch(`/expenses${query}`);
    if (res.success && res.data) {
      setExpenses(res.data);
    }
    setLoading(false);
  };

  const fetchSuppliers = async () => {
    const res = await apiFetch('/suppliers');
    if (res.success && res.data) {
      setSuppliers(res.data);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await apiFetch('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        ...formData,
        amount: Number(formData.amount),
        vatRate: Number(formData.vatRate),
      }),
    });

    if (res.success) {
      setShowModal(false);
      setFormData({
        supplierId: '',
        category: 'Software',
        description: '',
        date: new Date().toISOString().split('T')[0],
        amount: 100,
        vatRate: 20,
        paymentStatus: 'PAID',
        notes: '',
      });
      fetchExpenses();
    } else {
      setError(res.error?.message || 'Failed to record expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
      if (res.success) {
        fetchExpenses();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expense Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track supplier invoices, operating costs and reclaimable input VAT</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-xs self-start"
        >
          <Plus size={16} />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by description..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">All Categories</option>
            <option value="Software">Software</option>
            <option value="Office">Office</option>
            <option value="Travel">Travel</option>
            <option value="Utilities">Utilities</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Marketing">Marketing</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing {expenses.length} expense records
        </span>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading expense records...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No expense records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Supplier / Description</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-right">VAT Rate</th>
                  <th className="py-3 px-4 text-right">VAT Amount</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {new Date(e.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{e.description}</div>
                      {e.supplier && <div className="text-[11px] text-slate-500">{e.supplier.name}</div>}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(e.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{Number(e.vatRate)}%</td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(e.vatAmount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">£{Number(e.total).toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {e.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Record Business Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Software">Software</option>
                    <option value="Office">Office</option>
                    <option value="Travel">Travel</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">-- Optional / None --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. Monthly AWS Server Hosting"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Net Amount (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">VAT Rate</label>
                  <select
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value={20}>Standard (20%)</option>
                    <option value={5}>Reduced (5%)</option>
                    <option value={0}>Zero Rate (0%)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
