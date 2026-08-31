import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Building, Users, Shield, Save, CheckCircle2, History } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'firm' | 'users' | 'audit'>('firm');

  const [firm, setFirm] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    companyNumber: '',
    vatNumber: '',
    address: '',
    postcode: '',
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
          companyNumber: res.data.companyNumber || '',
          vatNumber: res.data.vatNumber || '',
          address: res.data.address || '',
          postcode: res.data.postcode || '',
        });
      }
    } else if (activeTab === 'users') {
      const res = await apiFetch('/firms/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } else if (activeTab === 'audit') {
      const res = await apiFetch('/audit');
      if (res.success && res.data) {
        setAuditLogs(res.data);
      }
    }
    setLoading(false);
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

          <form onSubmit={handleUpdateFirm} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Registered Name *</label>
              <input
                type="text"
                required
                disabled={user?.role !== 'ADMIN'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">UK Companies House Number</label>
                <input
                  type="text"
                  disabled={user?.role !== 'ADMIN'}
                  value={formData.companyNumber}
                  onChange={(e) => setFormData({ ...formData, companyNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="08123456"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HMRC VAT Registration Number (VRN)</label>
                <input
                  type="text"
                  disabled={user?.role !== 'ADMIN'}
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                  placeholder="GB987654321"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Address</label>
                <input
                  type="text"
                  disabled={user?.role !== 'ADMIN'}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">UK Postcode</label>
                <input
                  type="text"
                  disabled={user?.role !== 'ADMIN'}
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {user?.role === 'ADMIN' && (
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
                <tr key={u.id} className="hover:bg-slate-50">
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
