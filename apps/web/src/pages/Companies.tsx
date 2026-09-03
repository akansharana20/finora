import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Shield,
  Briefcase,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  companyNumber?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country?: string;
  currency?: string;
  contactEmail?: string;
  contactPhone?: string;
  vatScheme?: string;
  vatRegistered?: boolean;
  financialYearStart?: number;
  isActive?: boolean;
  createdAt?: string;
  _count?: {
    invoices?: number;
    expenses?: number;
    customers?: number;
    users?: number;
  };
}

export const Companies: React.FC = () => {
  const { user, activeFirmId, switchCompany } = useAuth();

  // Role guard: Only ADMIN can access company management
  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    companyNumber: '',
    vatNumber: '',
    address: '',
    city: '',
    county: '',
    postcode: '',
    country: 'GB',
    currency: 'GBP',
    contactEmail: '',
    contactPhone: '',
    vatScheme: 'STANDARD',
    vatRegistered: true,
    financialYearStart: 4,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch('/firms');
    if (res.success && res.data) {
      setCompanies(res.data);
    } else {
      setError(res.error?.message || 'Failed to fetch companies');
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      legalName: '',
      companyNumber: '',
      vatNumber: '',
      address: '',
      city: '',
      county: '',
      postcode: '',
      country: 'GB',
      currency: 'GBP',
      contactEmail: '',
      contactPhone: '',
      vatScheme: 'STANDARD',
      vatRegistered: true,
      financialYearStart: 4,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name || '',
      legalName: comp.legalName || comp.name || '',
      companyNumber: comp.companyNumber || '',
      vatNumber: comp.vatNumber || '',
      address: comp.address || '',
      city: comp.city || '',
      county: comp.county || '',
      postcode: comp.postcode || '',
      country: comp.country || 'GB',
      currency: comp.currency || 'GBP',
      contactEmail: comp.contactEmail || '',
      contactPhone: comp.contactPhone || '',
      vatScheme: comp.vatScheme || 'STANDARD',
      vatRegistered: comp.vatRegistered !== undefined ? comp.vatRegistered : true,
      financialYearStart: comp.financialYearStart || 4,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    if (editingCompany) {
      const res = await apiFetch(`/firms/${editingCompany.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setSuccessMessage(`Company "${formData.name}" updated successfully`);
        setShowModal(false);
        fetchCompanies();
        if (activeFirmId === editingCompany.id) {
          switchCompany(editingCompany.id, formData.name);
        }
      } else {
        setError(res.error?.message || 'Failed to update company');
      }
    } else {
      const res = await apiFetch('/firms', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success && res.data) {
        setSuccessMessage(`Company "${formData.name}" created successfully`);
        setShowModal(false);
        fetchCompanies();
      } else {
        setError(res.error?.message || 'Failed to create company');
      }
    }
  };

  const handleToggleStatus = async (comp: Company) => {
    const newStatus = !comp.isActive;
    const res = await apiFetch(`/firms/${comp.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: newStatus }),
    });

    if (res.success) {
      setSuccessMessage(`Company "${comp.name}" ${newStatus ? 'activated' : 'deactivated'}`);
      fetchCompanies();
    } else {
      setError(res.error?.message || 'Failed to update company status');
    }
  };

  const handleSwitchCompany = (comp: Company) => {
    switchCompany(comp.id, comp.name);
    setSuccessMessage(`Switched active company to "${comp.name}". Workspace scoped to this entity.`);
  };

  const filteredCompanies = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.legalName?.toLowerCase().includes(q) ||
      c.vatNumber?.toLowerCase().includes(q) ||
      c.companyNumber?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Company Management</h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Shield size={12} />
              <span>Admin Only</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organizations, tax registrations and switch active company context
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-xs flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Currently Selected Active Company Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              Currently Selected Active Company
            </div>
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <span>{companies.find((c) => c.id === activeFirmId)?.name || user?.firmName || 'Acme Consulting Ltd'}</span>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-medium">
                Active Context
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 flex items-center space-x-4">
          <div>
            <span className="text-slate-400 block text-[10px]">Tax Scheme</span>
            <span className="font-semibold text-white">UK Standard (20%)</span>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <span className="text-slate-400 block text-[10px]">Data Isolation</span>
            <span className="font-semibold text-emerald-400">Strictly Enforced</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies by name, VAT or Reg number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((comp) => {
            const isCurrentActive = comp.id === activeFirmId;

            return (
              <div
                key={comp.id}
                className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
                  isCurrentActive
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{comp.name}</h3>
                      {comp.legalName && comp.legalName !== comp.name && (
                        <p className="text-[11px] text-slate-500">{comp.legalName}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      {comp.isActive !== false ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Companies House:</span>
                      <span className="font-mono font-semibold">{comp.companyNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">VAT Reg (VRN):</span>
                      <span className="font-mono font-semibold">{comp.vatNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">VAT Scheme:</span>
                      <span className="font-medium text-slate-700">{comp.vatScheme || 'STANDARD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-700">
                        {[comp.city, comp.postcode, comp.country].filter(Boolean).join(', ') || 'United Kingdom'}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Counts */}
                  {comp._count && (
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-4">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="block font-bold text-slate-800">{comp._count.invoices ?? 0}</span>
                        <span className="text-slate-400 text-[10px]">Invoices</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="block font-bold text-slate-800">{comp._count.expenses ?? 0}</span>
                        <span className="text-slate-400 text-[10px]">Expenses</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="block font-bold text-slate-800">{comp._count.customers ?? 0}</span>
                        <span className="text-slate-400 text-[10px]">Customers</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(comp)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Company Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(comp)}
                      className={`p-1.5 rounded transition-colors ${
                        comp.isActive !== false
                          ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={comp.isActive !== false ? 'Deactivate Company' : 'Activate Company'}
                    >
                      {comp.isActive !== false ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                    </button>
                  </div>

                  {isCurrentActive ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/50 flex items-center space-x-1">
                      <CheckCircle2 size={13} />
                      <span>Current Active</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSwitchCompany(comp)}
                      className="text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors flex items-center space-x-1"
                    >
                      <span>Switch Company</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT COMPANY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="text-blue-600" size={20} />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingCompany ? `Edit Company: ${editingCompany.name}` : 'Add New Company'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Company Trading Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="e.g. Acme Consulting Ltd"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Legal / Registered Name</label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Official registered legal name"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Companies House Number</label>
                  <input
                    type="text"
                    value={formData.companyNumber}
                    onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    placeholder="e.g. 08123456"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HMRC VAT Number (VRN)</label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    placeholder="e.g. GB987654321"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">County / Region</label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="Greater London"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postcode</label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 uppercase"
                    placeholder="EC2N 4AG"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="finance@company.co.uk"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="020 7946 0000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UK VAT Scheme</label>
                  <select
                    value={formData.vatScheme}
                    onChange={(e) => setFormData({ ...formData, vatScheme: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value="STANDARD">Standard VAT Accounting</option>
                    <option value="FLAT_RATE">Flat Rate Scheme</option>
                    <option value="CASH">Cash Accounting Scheme</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Financial Year Start</label>
                  <select
                    value={formData.financialYearStart}
                    onChange={(e) => setFormData({ ...formData, financialYearStart: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                  >
                    <option value={1}>January</option>
                    <option value={4}>April (UK Default)</option>
                    <option value={7}>July</option>
                    <option value={10}>October</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
                  {editingCompany ? 'Save Changes' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
