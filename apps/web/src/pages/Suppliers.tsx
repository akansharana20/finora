import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Link } from 'react-router-dom';
import { Search, Plus, Building2, Mail, Phone, ArrowUpRight, X } from 'lucide-react';

export const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    vatNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const fetchSuppliers = async () => {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiFetch(`/suppliers${query}`);
    if (res.success && res.data) {
      setSuppliers(res.data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await apiFetch('/suppliers', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setShowModal(false);
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        address: '',
        postcode: '',
        vatNumber: '',
        notes: '',
      });
      fetchSuppliers();
    } else {
      setError(res.error?.message || 'Failed to create supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Supplier Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vendor records, expense tracking and VAT tax numbers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors flex items-center space-x-1.5 shadow-xs self-start"
        >
          <Plus size={16} />
          <span>Add New Supplier</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, company, email..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {suppliers.length} supplier records
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading supplier directory...</div>
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No supplier records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Contact Information</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">VAT Registration</th>
                  <th className="py-3 px-4 text-right">Total Expenses</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Link to={`/suppliers/${s.id}`} className="font-bold text-blue-600 hover:underline block">
                        {s.name}
                      </Link>
                      {s.companyName && <span className="text-slate-500 text-[11px] block">{s.companyName}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.email || '—'}</div>
                      <div className="text-[11px] text-slate-400">{s.phone || ''}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.postcode || '—'}</div>
                      <div className="text-[11px] text-slate-400">{s.address || ''}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {s.vatNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      £{Number(s.totalExpenses).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/suppliers/${s.id}`}
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

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Supplier / Vendor</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="AWS UK Cloud Services"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Amazon Web Services EMEA SARL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="billing@aws.amazon.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="0800 496 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="1 Principal Place"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="EC2A 2FA"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier VAT Number</label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="GB899200001"
                />
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
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
