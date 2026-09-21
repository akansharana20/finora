import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Building, Users, Shield, Save, CheckCircle2, History, AlertCircle, X } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const canManageCompany = user?.membershipRole === 'ADMIN';
  const [activeTab, setActiveTab] = useState<'firm' | 'users' | 'audit'>('firm');

  const [firm, setFirm] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    companyNumber: '',
    vatNumber: '',
    address: '',
    city: '',
    county: '',
    postcode: '',
    contactEmail: '',
    contactPhone: '',
    vatScheme: 'STANDARD',
    financialYearStart: 4,
  });

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettingsData();
  }, [activeTab]);

  const fetchSettingsData = async () => {
    setLoading(true);
    if (activeTab === 'firm') {
      const res = await apiFetch('/firms/profile');
      if (res.success && res.data) {
        setFirm(res.data);
        setFormData({
          name: res.data.name || '',
          legalName: res.data.legalName || res.data.name || '',
          companyNumber: res.data.companyNumber || '',
          vatNumber: res.data.vatNumber || '',
          address: res.data.address || '',
          city: res.data.city || '',
          county: res.data.county || '',
          postcode: res.data.postcode || '',
          contactEmail: res.data.contactEmail || '',
          contactPhone: res.data.contactPhone || '',
          vatScheme: res.data.vatScheme || 'STANDARD',
          financialYearStart: res.data.financialYearStart || 4,
        });
      }
    } else if (activeTab === 'users') {
      const [userRes, firmsRes] = await Promise.all([apiFetch('/firms/users'), apiFetch('/firms')]);
      if (userRes.success && userRes.data) {
        setUsers(userRes.data);
        if (!selectedUserId && userRes.data[0]) setSelectedUserId(userRes.data[0].id);
      }
      if (firmsRes.success && firmsRes.data) {
        setCompanies(firmsRes.data);
        const membershipResponses = await Promise.all(firmsRes.data.map((company: any) => apiFetch(`/firms/${company.id}/users`)));
        const nextAssignments: Record<string, string[]> = {};
        membershipResponses.forEach((response: any, index) => {
          if (response.success && Array.isArray(response.data)) {
            response.data.forEach((member: any) => {
              (nextAssignments[member.id] ||= []).push(firmsRes.data[index].id);
            });
          }
        });
        setAssignments(nextAssignments);
      }
    } else if (activeTab === 'audit') {
      const res = await apiFetch('/audit');
      if (res.success && res.data) {
        setAuditLogs(res.data);
      }
    }
    setLoading(false);
  };

  const selectedUser = users.find((candidate) => candidate.id === selectedUserId);
  const selectedUserAssignments = assignments[selectedUserId] || [];
  const manageableCompanies = companies.filter((company) => company.memberships?.[0]?.role === 'ADMIN');

  const changeAssignment = async (firmId: string, remove = false) => {
    if (!selectedUserId) return;
    setAssignmentBusy(true); setAssignmentError(null); setMessage(null);
    const response = await apiFetch(`/firms/${firmId}/users/${selectedUserId}`, {
      method: remove ? 'DELETE' : 'PUT',
      body: remove ? undefined : JSON.stringify({ role: selectedUser?.role || 'USER' }),
    });
    setAssignmentBusy(false);
    if (!response.success) { setAssignmentError(response.error?.message || 'Unable to update company assignment'); return; }
    setMessage(remove ? 'Company access removed.' : 'Company access assigned.');
    fetchSettingsData();
  };

  const handleUpdateFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const res = await apiFetch('/firms/profile', {
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setMessage('Firm settings updated successfully');
      fetchSettingsData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Compliance</h2>
        <p className="text-xs text-slate-500 mt-0.5">Firm registration details, user RBAC roles and immutable audit trail</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('firm')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'firm'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Firm Profile & Tax
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          User Roles & RBAC ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'audit'
              ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          System Audit Log
        </button>
      </div>

      {/* FIRM PROFILE TAB */}
      {activeTab === 'firm' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          {message && (
            <div className="p-3 mb-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          {/* Manage Companies Banner for Admin */}
          {user?.role === 'ADMIN' && (
            <div className="p-4 mb-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Multi-Company Management</span>
                <span className="text-[11px] text-slate-500">
                  Switch between organizations or register additional entities
                </span>
              </div>
              <a
                href="/companies"
                className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded text-xs shadow-xs transition-colors inline-flex items-center space-x-1"
              >
                <span>Manage All Companies</span>
                <span>→</span>
              </a>
            </div>
          )}

          <form onSubmit={handleUpdateFirm} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Trading Name *</label>
                <input
                  type="text"
                  required
                  disabled={!canManageCompany}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Legal / Registered Name</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UK Companies House Number</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.companyNumber}
                  onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  placeholder="08123456"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HMRC VAT Registration Number (VRN)</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  placeholder="GB987654321"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Address</label>
              <input
                type="text"
                disabled={!canManageCompany}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">County</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UK Postcode</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  disabled={!canManageCompany}
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="finance@company.co.uk"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  disabled={!canManageCompany}
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="020 7946 0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">VAT Scheme</label>
                <select
                  disabled={!canManageCompany}
                  value={formData.vatScheme}
                  onChange={(e) => setFormData({ ...formData, vatScheme: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value="STANDARD">Standard Accounting (Accrual)</option>
                  <option value="FLAT_RATE">Flat Rate Scheme</option>
                  <option value="CASH">Cash Accounting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Financial Year Start</label>
                <select
                  disabled={!canManageCompany}
                  value={formData.financialYearStart}
                  onChange={(e) => setFormData({ ...formData, financialYearStart: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                >
                  <option value={1}>January</option>
                  <option value={4}>April (UK standard)</option>
                  <option value={7}>July</option>
                  <option value={10}>October</option>
                </select>
              </div>
            </div>

            {canManageCompany && (
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs flex items-center space-x-1.5"
                >
                  <Save size={16} />
                  <span>Update Firm Profile</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* USERS & RBAC TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Firm Authorized Users & Roles</h3>
            <span className="text-xs text-slate-500">Enforced by backend RBAC middleware</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4">User Name</th>
                <th className="py-2.5 px-4">Email Address</th>
                <th className="py-2.5 px-4">Role Permission</th>
                <th className="py-2.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} onClick={() => canManageCompany && setSelectedUserId(u.id)} className={`hover:bg-slate-50 ${selectedUserId === u.id ? 'bg-blue-50' : ''} ${canManageCompany ? 'cursor-pointer' : ''}`}>
                  <td className="py-3 px-4 font-bold text-slate-800">{u.name}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'ACCOUNTANT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {canManageCompany && selectedUser && (
            <div className="border-t border-slate-200 p-5 bg-slate-50">
              <h4 className="font-bold text-sm text-slate-900">Company assignments for {selectedUser.name}</h4>
              <p className="text-xs text-slate-500 mt-1">Access is enforced by the API; this page reflects the server’s current memberships.</p>
              {assignmentError && <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex gap-2"><AlertCircle size={15} /><span>{assignmentError}</span></div>}
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedUserAssignments.length ? selectedUserAssignments.map((firmId) => {
                  const company = companies.find((item) => item.id === firmId);
                  const canManage = company?.memberships?.[0]?.role === 'ADMIN';
                  return company && <span key={firmId} className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full pl-3 pr-1 py-1 text-xs font-medium text-slate-700">
                    ✓ {company.name}
                    {canManage && <button disabled={assignmentBusy} onClick={() => changeAssignment(firmId, true)} className="p-1 text-slate-400 hover:text-red-700 disabled:opacity-50" aria-label={`Remove ${company.name} access`} title="Remove company access"><X size={13} /></button>}
                  </span>;
                }) : <span className="text-xs text-slate-500">No company assignments.</span>}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <select value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)} className="flex-1 p-2 border border-slate-300 rounded text-xs bg-white">
                  <option value="">Select a company to assign</option>
                  {manageableCompanies.filter((company) => !selectedUserAssignments.includes(company.id)).map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>
                <button disabled={!selectedCompanyId || assignmentBusy} onClick={() => { changeAssignment(selectedCompanyId); setSelectedCompanyId(''); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded text-xs">{assignmentBusy ? 'Updating…' : 'Assign company'}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SYSTEM AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Immutable Audit Trail</h3>
            <span className="text-xs text-slate-500">Security & compliance log</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-blue-600">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">{log.user?.name || 'System'}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.entity}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.metadata || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
