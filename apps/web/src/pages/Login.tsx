import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@acme.co.uk');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handlePresetLogin = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setError(null);
    setLoading(true);
    const res = await login(presetEmail, 'Password123!');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-950 p-6 text-white text-center border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 font-bold text-2xl text-white shadow-lg shadow-blue-500/30 mb-3">
            F
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Finora V1</h2>
          <p className="text-xs text-slate-400 mt-1">UK Accounting & Financial Management Platform</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="admin@acme.co.uk"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Finora'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Preset Demo Logins */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Demo Accounts
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  isDemo ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-700'
                }`}
              >
                DEMO_MODE={isDemo ? 'true' : 'false'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetLogin('admin@acme.co.uk')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-between transition-colors shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <span>👑</span>
                  <span>Login as Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">admin@acme.co.uk</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetLogin('accountant@acme.co.uk')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-between transition-colors shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Login as Accountant</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">accountant@acme.co.uk</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handlePresetLogin('user@acme.co.uk')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-between transition-colors shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <span>👤</span>
                  <span>Login as Staff User</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">staff@acme.co.uk</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Default password:{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">Password123!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
