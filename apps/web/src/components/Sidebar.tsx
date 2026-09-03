import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Building2,
  Wallet,
  CreditCard,
  Percent,
  FileCheck,
  Landmark,
  Share2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(true);
  const [vatOpen, setVatOpen] = useState(true);
  const [integrationsOpen, setIntegrationsOpen] = useState(true);

  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const { user, activeFirmId, activeFirmName, switchCompany } = useAuth();

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      apiFetch('/firms').then((res) => {
        if (res.success && res.data) {
          setCompanies(res.data);
        }
      });
    }
  }, [user?.role, activeFirmId]);

  const handleSelectCompany = (c: any) => {
    switchCompany(c.id, c.name);
    setCompanyMenuOpen(false);
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              F
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Finora</span>
              <span className="text-xs bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded ml-1.5 font-medium border border-blue-700/50">
                V1 UK
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white mx-auto shadow-md shadow-blue-500/20">
            F
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Firm & Role Badge / Company Switcher */}
      {!isCollapsed && (
        <div className="relative px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
          {user?.role === 'ADMIN' ? (
            <button
              onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
              className="w-full text-left p-1.5 -m-1.5 rounded-lg hover:bg-slate-800/70 transition-colors group flex items-center justify-between"
              title="Click to switch active company"
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <Building size={14} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-white truncate group-hover:text-blue-300">
                  {activeFirmName || user?.firmName || 'Acme Consulting Ltd'}
                </span>
              </div>
              <ChevronsUpDown size={14} className="text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <Building size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-200 truncate">
                {activeFirmName || user?.firmName || 'Acme Consulting Ltd'}
              </span>
            </div>
          )}

          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>Role: <strong className="text-blue-400 font-medium">{user?.role}</strong></span>
            <span className="text-emerald-400 font-medium">● GBP VAT</span>
          </div>

          {/* Switcher Dropdown Menu */}
          {companyMenuOpen && user?.role === 'ADMIN' && (
            <div className="absolute left-2 right-2 top-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1 divide-y divide-slate-800">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Company
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {companies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCompany(c)}
                    className="w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200"
                  >
                    <div className="truncate mr-2">
                      <span className="font-semibold block truncate">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.vatNumber || c.companyNumber || 'UK Firm'}</span>
                    </div>
                    {c.id === activeFirmId && <Check size={14} className="text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="p-1.5 bg-slate-950/60">
                <Link
                  to="/companies"
                  onClick={() => setCompanyMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold rounded hover:bg-slate-800"
                >
                  <Building2 size={13} />
                  <span>Manage Companies</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-sm">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`
          }
          title="Dashboard"
        >
          <LayoutDashboard size={18} className="shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* Companies (Admin only) */}
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/companies"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`
            }
            title="Company Management"
          >
            <Building2 size={18} className="shrink-0" />
            {!isCollapsed && <span>Companies</span>}
          </NavLink>
        )}

        {/* Accounting Group */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => setAccountingOpen(!accountingOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white"
            >
              <span>Accounting</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${accountingOpen ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <div className="my-2 border-t border-slate-800" />
          )}

          {(accountingOpen || isCollapsed) && (
            <div className="space-y-0.5 mt-0.5">
              <NavLink
                to="/invoices"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Invoices"
              >
                <Receipt size={18} className="shrink-0" />
                {!isCollapsed && <span>Invoices</span>}
              </NavLink>

              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Customers"
              >
                <Users size={18} className="shrink-0" />
                {!isCollapsed && <span>Customers</span>}
              </NavLink>

              <NavLink
                to="/suppliers"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Suppliers"
              >
                <Building2 size={18} className="shrink-0" />
                {!isCollapsed && <span>Suppliers</span>}
              </NavLink>

              <NavLink
                to="/expenses"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Expenses"
              >
                <Wallet size={18} className="shrink-0" />
                {!isCollapsed && <span>Expenses</span>}
              </NavLink>

              <NavLink
                to="/payments"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Payments"
              >
                <CreditCard size={18} className="shrink-0" />
                {!isCollapsed && <span>Payments</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* VAT & Tax Group */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => setVatOpen(!vatOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white mt-2"
            >
              <span>VAT & Tax</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${vatOpen ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <div className="my-2 border-t border-slate-800" />
          )}

          {(vatOpen || isCollapsed) && (
            <div className="space-y-0.5 mt-0.5">
              <NavLink
                to="/vat"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="VAT Overview"
              >
                <Percent size={18} className="shrink-0" />
                {!isCollapsed && <span>VAT Overview</span>}
              </NavLink>

              <NavLink
                to="/vat/returns"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="VAT Returns"
              >
                <FileCheck size={18} className="shrink-0" />
                {!isCollapsed && <span>VAT Returns</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Integrations Group */}
        <div>
          {!isCollapsed ? (
            <button
              onClick={() => setIntegrationsOpen(!integrationsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white mt-2"
            >
              <span>Integrations</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${integrationsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <div className="my-2 border-t border-slate-800" />
          )}

          {(integrationsOpen || isCollapsed) && (
            <div className="space-y-0.5 mt-0.5">
              <NavLink
                to="/integrations"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="Integrations Center"
              >
                <Share2 size={18} className="shrink-0" />
                {!isCollapsed && <span>Integrations</span>}
              </NavLink>

              <NavLink
                to="/integrations/hmrc"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`
                }
                title="HMRC MTD"
              >
                <Landmark size={18} className="shrink-0" />
                {!isCollapsed && <span>HMRC MTD</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="mt-2">
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`
            }
            title="Reports"
          >
            <BarChart3 size={18} className="shrink-0" />
            {!isCollapsed && <span>Reports</span>}
          </NavLink>
        </div>

        {/* Settings */}
        <div>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`
            }
            title="Settings"
          >
            <Settings size={18} className="shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};
