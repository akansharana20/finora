import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, isDemo } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Finora Accounting V1
        </h1>
        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded border border-slate-200">
          UK GAAP & MTD VAT
        </span>
        {isDemo && (
          <span
            className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center space-x-1 shadow-2xs"
            title="Running in Frontend Demo Mode with sample accounting data"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            <span>DEMO MODE</span>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3 border-r border-slate-200 pr-4">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-800 leading-none">{user?.name}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100"
          title="Sign out"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
