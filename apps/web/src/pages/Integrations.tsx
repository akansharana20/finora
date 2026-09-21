import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Landmark, Share2, CreditCard, RefreshCw, CheckCircle2, AlertCircle, Shield, ExternalLink } from 'lucide-react';

export const Integrations: React.FC = () => {
  const { activeFirmId } = useAuth();
  const [searchParams] = useSearchParams();
  const [hmrcStatus, setHmrcStatus] = useState<any>(null);
  const [connectingHmrc, setConnectingHmrc] = useState(false);
  const [xeroStatus, setXeroStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingHmrc, setSyncingHmrc] = useState(false);
  const [hmrcSuccessMessage, setHmrcSuccessMessage] = useState<string | null>(null);
  const [hmrcErrorMessage, setHmrcErrorMessage] = useState<string | null>(null);
  const [syncingXero, setSyncingXero] = useState(false);
  const [xeroMessage, setXeroMessage] = useState<string | null>(null);

  useEffect(() => {
    setHmrcStatus(null);
    setXeroStatus(null);
    fetchStatus();
  }, [activeFirmId]);

  // Handle incoming OAuth callback query parameters from HMRC redirect
  useEffect(() => {
    const hmrcParam = searchParams.get('hmrc');
    const hmrcErrParam = searchParams.get('hmrc_error');

    if (hmrcParam === 'connected') {
      setHmrcSuccessMessage('Successfully connected to HMRC Making Tax Digital VAT!');
      setHmrcErrorMessage(null);
      fetchStatus();
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (hmrcErrParam) {
      const decoded = decodeURIComponent(hmrcErrParam);
      let readableError = decoded;
      if (decoded === 'missing_firm_context') readableError = 'Unable to identify company context for HMRC connection.';
      else if (decoded === 'missing_code') readableError = 'HMRC did not return an authorization code.';
      else if (decoded === 'access_denied') readableError = 'HMRC authorization was cancelled or denied.';
      else if (decoded === 'connection_failed') readableError = 'HMRC could not complete the connection. Please try again or contact support.';
      setHmrcErrorMessage(`HMRC connection error: ${readableError}`);
      setHmrcSuccessMessage(null);
      fetchStatus();
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams]);

  const fetchStatus = async () => {
    setLoading(true);
    const [hmrcRes, xeroRes] = await Promise.all([
      apiFetch('/hmrc/status'),
      apiFetch('/xero/status'),
    ]);

    if (hmrcRes.success) {
      setHmrcStatus(hmrcRes.data);
    } else {
      setHmrcStatus(null);
      setHmrcErrorMessage(hmrcRes.error?.message || 'Failed to fetch HMRC connection status');
    }

    if (xeroRes.success) setXeroStatus(xeroRes.data);
    setLoading(false);
  };

  const toggleHmrc = async () => {
    setHmrcErrorMessage(null);
    setHmrcSuccessMessage(null);

    if (hmrcStatus?.isConnected) {
      setConnectingHmrc(true);
      const res = await apiFetch('/hmrc/disconnect', { method: 'POST' });
      setConnectingHmrc(false);
      if (res.success) {
        setHmrcSuccessMessage('Disconnected from HMRC successfully.');
        fetchStatus();
      } else {
        setHmrcErrorMessage(res.error?.message || 'Failed to disconnect from HMRC.');
      }
    } else {
      setConnectingHmrc(true);
      const res = await apiFetch('/hmrc/connect');
      setConnectingHmrc(false);
      if (res.success && res.data?.url) {
        const url = res.data.url;
        if (url.startsWith('#') || url.includes('demo-connected')) {
          setHmrcErrorMessage('Backend returned a demo fallback URL (#demo-connected) instead of an HMRC sandbox OAuth redirect.');
          return;
        }
        window.location.href = url;
        return;
      } else {
        setHmrcErrorMessage(res.error?.message || 'Failed to initialize HMRC connection. Please verify server configuration.');
      }
    }
  };

  const handleSyncHmrc = async () => {
    setSyncingHmrc(true);
    setHmrcSuccessMessage(null);
    setHmrcErrorMessage(null);
    const res = await apiFetch('/hmrc/obligations/sync', { method: 'POST' });
    setSyncingHmrc(false);
    if (res.success) {
      const count = Array.isArray(res.data) ? ` (${res.data.length} obligations recorded)` : '';
      setHmrcSuccessMessage(`Successfully synchronized obligations from HMRC MTD${count}.`);
      fetchStatus();
    } else {
      setHmrcErrorMessage(res.error?.message || 'Failed to sync obligations from HMRC.');
    }
  };

  const toggleXero = async () => {
    if (xeroStatus?.isConnected) {
      await apiFetch('/xero/disconnect', { method: 'POST' });
    } else {
      const res = await apiFetch('/xero/connect');
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    }
    fetchStatus();
  };

  const handleSyncXero = async () => {
    setSyncingXero(true);
    setXeroMessage(null);
    const res = await apiFetch('/xero/sync', { method: 'POST' });
    setSyncingXero(false);

    if (res.success && res.data?.stats) {
      const { createdCustomers, createdInvoices } = res.data.stats;
      setXeroMessage(`Synced ${createdCustomers} contacts & ${createdInvoices} invoices from Xero.`);
      fetchStatus();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-xs">Loading integration center...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Finora Integration Hub</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage external tax, accounting & payment gateway connections</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HMRC CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Landmark size={20} />
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  hmrcStatus?.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {hmrcStatus?.isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4">HMRC MTD VAT</h3>
            <p className="text-xs text-slate-500 mt-1">
              Direct connection to HM Revenue & Customs for Making Tax Digital VAT obligation sync and quarterly returns.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div>VRN: <strong className="font-mono text-slate-800">{hmrcStatus?.vrn || 'Not Connected'}</strong></div>
              <div>Environment: <strong className={`font-semibold ${hmrcStatus?.environment === 'production' ? 'text-emerald-600' : 'text-blue-600'}`}>{hmrcStatus?.environment || 'sandbox'}</strong></div>
              {hmrcStatus?.lastSyncAt && (
                <div>Last Sync: <span className="text-slate-500">{new Date(hmrcStatus.lastSyncAt).toLocaleString('en-GB')}</span></div>
              )}
            </div>

            {hmrcSuccessMessage && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-lg font-medium flex items-start space-x-1.5">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="leading-snug">{hmrcSuccessMessage}</span>
              </div>
            )}

            {hmrcErrorMessage && (
              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg font-medium flex items-start space-x-1.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-600" />
                <span className="leading-snug">{hmrcErrorMessage}</span>
              </div>
            )}

            {hmrcStatus?.reauthRequired && !hmrcErrorMessage && (
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-lg font-medium flex items-start space-x-1.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <span className="leading-snug">HMRC authorization has expired. Please click &ldquo;Connect to HMRC&rdquo; to re-authorize.</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {hmrcStatus?.isConnected && (
              <button
                onClick={handleSyncHmrc}
                disabled={syncingHmrc}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncingHmrc ? 'animate-spin' : ''} />
                <span>{syncingHmrc ? 'Syncing Obligations...' : 'Sync Obligations Now'}</span>
              </button>
            )}

            {hmrcStatus?.hmrcAvailable !== false && <button
              onClick={toggleHmrc}
              disabled={connectingHmrc}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center space-x-1.5 ${
                hmrcStatus?.isConnected
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50'
              }`}
            >
              {connectingHmrc ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>{hmrcStatus?.isConnected ? 'Disconnect HMRC' : 'Connect to HMRC'}</span>
              )}
            </button>}
            {hmrcStatus?.hmrcAvailable === false && (
              <div className="text-[11px] text-slate-500 text-center border border-slate-200 rounded-lg py-2">
                HMRC MTD is unavailable because this company is not VAT registered or has no valid VRN.
              </div>
            )}
          </div>
        </div>

        {/* XERO CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Share2 size={20} />
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  xeroStatus?.isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {xeroStatus?.isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4">Xero Accounting</h3>
            <p className="text-xs text-slate-500 mt-1">
              Synchronize contacts, invoices and financial records between Xero and Finora automatically.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div>Org: <strong className="text-slate-800">{xeroStatus?.tenantName || 'Not connected'}</strong></div>
              <div>Environment: <strong className="text-blue-600 font-semibold">{xeroStatus?.environment || 'sandbox'}</strong></div>
              {xeroStatus?.lastSyncAt && (
                <div>Last Sync: <span className="text-slate-500">{new Date(xeroStatus.lastSyncAt).toLocaleString('en-GB')}</span></div>
              )}
            </div>

            {xeroMessage && (
              <div className="mt-2 p-2 bg-emerald-50 text-emerald-800 text-[11px] rounded font-medium">
                {xeroMessage}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {xeroStatus?.isConnected && (
              <button
                onClick={handleSyncXero}
                disabled={syncingXero}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncingXero ? 'animate-spin' : ''} />
                <span>{syncingXero ? 'Syncing...' : 'Sync Data Now'}</span>
              </button>
            )}

            <button
              onClick={toggleXero}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                xeroStatus?.isConnected
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
            >
              {xeroStatus?.isConnected ? 'Disconnect Xero' : 'Connect to Xero'}
            </button>
          </div>
        </div>

        {/* PAYMENTS PROVIDER CARD */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4">Internal Payment Provider</h3>
            <p className="text-xs text-slate-500 mt-1">
              Internal payment engine with extensible provider interface for card payments and BACS transfer recording.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
              <div>Provider: <strong className="text-slate-800">Internal Engine</strong></div>
              <div>Supported: <span className="text-slate-500">BACS, Card, Direct Debit</span></div>
              <div>Status: <span className="text-emerald-600 font-semibold">Ready for live gateway key</span></div>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 text-center border border-slate-200">
            Provider abstraction layer operational
          </div>
        </div>
      </div>
    </div>
  );
};
