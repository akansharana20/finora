import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { Percent, Landmark, FileCheck, Calendar, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const VatOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVatOverview();
  }, []);

  const fetchVatOverview = async () => {
    setLoading(true);
    const res = await apiFetch('/vat/overview');
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error?.message || 'Failed to load VAT overview');
    }
    setLoading(false);
  };

  const handlePrepareReturn = async (periodKey: string) => {
    const res = await apiFetch(`/vat/returns/${periodKey}/prepare`, { method: 'POST' });
    if (res.success) {
      navigate(`/vat/returns/${periodKey}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-xs">Calculating live VAT position...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>;

  const { currentPeriod, liveCalculation, obligations, returns, hmrcConnectionStatus } = data;

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">UK VAT & HMRC MTD Compliance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated 9-Box MTD calculation engine and HMRC submission workflow</p>
        </div>

        {/* HMRC Connection Badge */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <Landmark size={18} className={hmrcConnectionStatus.isConnected ? 'text-emerald-600' : 'text-slate-400'} />
          <div className="text-xs">
            <span className="font-bold text-slate-800 block leading-tight">
              {hmrcConnectionStatus.isConnected ? 'HMRC Connected' : 'HMRC Not Connected'}
            </span>
            <span className="text-[10px] text-slate-500">
              VRN: {hmrcConnectionStatus.vrn || '987654321'} ({hmrcConnectionStatus.environment})
            </span>
          </div>
          <Link
            to="/integrations/hmrc"
            className="ml-2 text-[11px] font-bold text-blue-600 hover:underline"
          >
            Manage
          </Link>
        </div>
      </div>

      {/* TOP PRIORITY VAT PERIOD & LIABILITY HEADER (Requirement 26) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">Current VAT Period</span>
          <span className="text-lg font-bold text-slate-900 block">{currentPeriod.periodKey}</span>
          <span className="text-xs text-slate-500">
            {new Date(currentPeriod.startDate).toLocaleDateString('en-GB')} – {new Date(currentPeriod.endDate).toLocaleDateString('en-GB')}
          </span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">HMRC Due Date</span>
          <span className="text-lg font-bold text-red-600 block">
            {new Date(currentPeriod.dueDate).toLocaleDateString('en-GB')}
          </span>
          <span className="text-xs text-slate-500">Filing deadline</span>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">VAT Output (Box 1)</span>
          <span className="text-lg font-bold text-slate-800 block">
            £{Number(liveCalculation.box1).toFixed(2)}
          </span>
          <span className="text-xs text-slate-500">{liveCalculation.transactionCount.invoices} sales invoices</span>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Estimated VAT Liability (Box 5)</span>
          <span className="text-2xl font-bold text-blue-600 block">
            £{Number(liveCalculation.box5).toFixed(2)}
          </span>
          <button
            onClick={() => handlePrepareReturn(currentPeriod.periodKey)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded text-xs shadow-xs inline-flex items-center space-x-1"
          >
            <span>Prepare VAT Return</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* WORKFLOW BANNER: CALCULATE -> REVIEW -> SUBMIT */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            3
          </div>
          <div>
            <h4 className="text-sm font-bold">Standard UK MTD Workflow</h4>
            <p className="text-xs text-slate-300">
              1. CALCULATE (Live DB) → 2. REVIEW (9-Box Return) → 3. SUBMIT (HMRC MTD API)
            </p>
          </div>
        </div>
        <button
          onClick={() => handlePrepareReturn(currentPeriod.periodKey)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 shadow-sm"
        >
          Review & File Return to HMRC
        </button>
      </div>

      {/* MTD 9-BOX LIVE SUMMARY */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Live 9-Box MTD VAT Calculation Preview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-500 block mb-1">Box 1: VAT due on sales</span>
            <span className="text-base font-bold text-slate-900">£{Number(liveCalculation.box1).toFixed(2)}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-500 block mb-1">Box 4: VAT reclaimed on purchases</span>
            <span className="text-base font-bold text-slate-900">£{Number(liveCalculation.box4).toFixed(2)}</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-bold text-blue-700 block mb-1">Box 5: Net VAT Payable / Reclaimable</span>
            <span className="text-lg font-bold text-blue-700">£{Number(liveCalculation.box5).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* OBLIGATIONS & HISTORICAL RETURNS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HMRC OBLIGATIONS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            HMRC VAT Obligations
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {obligations.map((ob: any) => (
              <div key={ob.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{ob.periodKey}</span>
                  <span className="text-[11px] text-slate-500 block">
                    {new Date(ob.startPeriod).toLocaleDateString('en-GB')} – {new Date(ob.endPeriod).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      ob.status === 'FULFILLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ob.status}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Due: {new Date(ob.dueDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMITTED VAT RETURNS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Submitted & Draft VAT Returns
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {returns.map((ret: any) => (
              <div key={ret.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <Link to={`/vat/returns/${ret.periodKey}`} className="font-bold text-blue-600 hover:underline">
                    Period {ret.periodKey}
                  </Link>
                  <span className="text-[11px] text-slate-500 block">Net VAT: £{Number(ret.box5).toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      ret.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ret.status}
                  </span>
                  {ret.submittedAt && (
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {ret.hmrcCorrelationId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
