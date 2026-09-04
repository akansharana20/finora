import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { ArrowLeft, Send, CheckCircle2, AlertCircle, ShieldCheck, FileCheck, CheckSquare, Square } from 'lucide-react';

export const VatReturnDetail: React.FC = () => {
  const { periodKey } = useParams<{ periodKey: string }>();
  const [vatReturn, setVatReturn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (periodKey) {
      apiFetch(`/vat/returns/${periodKey}`).then((res) => {
        if (res.success && res.data) {
          setVatReturn(res.data);
        }
        setLoading(false);
      });
    }
  }, [periodKey]);

  const handleSubmitToHmrc = async () => {
    if (!declarationConfirmed) {
      setError('Please review and confirm the official HMRC declaration before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await apiFetch(`/vat/returns/${periodKey}/submit`, { method: 'POST' });
    setSubmitting(false);

    if (res.success && res.data) {
      const receiptData = res.data.hmrcReceipt || {
        correlationId: res.data.vatReturn?.hmrcCorrelationId || res.data.receiptId,
      };
      setVatReturn((prev: any) => ({
        ...prev,
        status: 'SUBMITTED',
        submittedAt: res.data.vatReturn?.submittedAt || res.data.submittedAt || new Date().toISOString(),
        hmrcCorrelationId: receiptData.correlationId || res.data.vatReturn?.hmrcCorrelationId,
      }));
      setReceipt(receiptData);
      setShowConfirmModal(false);
    } else {
      setError(res.error?.message || 'HMRC MTD Submission failed. Please verify credentials and VAT obligation status.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 text-xs">Loading VAT Return details...</div>;
  if (!vatReturn) return <div className="p-8 text-center text-red-500 text-xs">VAT Return record not found. Prepare the return from VAT Overview first.</div>;

  const netPayable = Number(vatReturn.box5);
  const isPayable = netPayable >= 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/vat" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} />
        <span>Back to VAT Overview</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-slate-900">VAT Return Review — Period {vatReturn.periodKey}</h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                vatReturn.status === 'SUBMITTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {vatReturn.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Period: {new Date(vatReturn.startPeriod).toLocaleDateString('en-GB')} to {new Date(vatReturn.endPeriod).toLocaleDateString('en-GB')}
          </p>
        </div>

        {vatReturn.status !== 'SUBMITTED' && (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors flex items-center space-x-2 shadow-xs disabled:opacity-50"
          >
            <Send size={16} />
            <span>Submit Return to HMRC</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* HMRC SUCCESS RECEIPT BANNER */}
      {(receipt || vatReturn.status === 'SUBMITTED') && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-start space-x-3 text-xs shadow-xs">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-emerald-900">VAT Return Successfully Submitted to HMRC</div>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Filing receipt recorded under Making Tax Digital compliance standards. Keep this acknowledgment for your tax records.
            </p>
            <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white/70 p-3 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-900">
              <div>Correlation ID: <strong>{receipt?.correlationId || vatReturn.hmrcCorrelationId || 'Recorded'}</strong></div>
              {receipt?.formBundleNumber && <div>Form Bundle: <strong>{receipt.formBundleNumber}</strong></div>}
              {receipt?.chargeRefNumber && <div>Charge Reference: <strong>{receipt.chargeRefNumber}</strong></div>}
              {receipt?.paymentIndicator && <div>Payment Indicator: <strong>{receipt.paymentIndicator}</strong></div>}
              {vatReturn.submittedAt && (
                <div>Submitted At: <strong>{new Date(vatReturn.submittedAt).toLocaleString('en-GB')}</strong></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL HMRC MTD 9-BOX RETURN FORM */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">HM Revenue & Customs — MTD VAT Return</h3>
            <p className="text-xs text-slate-500">VAT Notice 700/22 Making Tax Digital</p>
          </div>
          <ShieldCheck size={24} className="text-blue-600" />
        </div>

        {/* 9 BOX TABLE */}
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Box 1</span>
              <span className="text-slate-500 block">VAT due in the period on sales and other outputs</span>
            </div>
            <span className="font-bold text-sm text-slate-900">£{Number(vatReturn.box1).toFixed(2)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Box 2</span>
              <span className="text-slate-500 block">VAT due in the period on acquisitions from other EC Member States</span>
            </div>
            <span className="font-bold text-sm text-slate-900">£{Number(vatReturn.box2).toFixed(2)}</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 flex items-center justify-between font-bold">
            <div>
              <span className="text-blue-900">Box 3 (Total VAT Due)</span>
              <span className="text-blue-700 font-normal block">Box 1 + Box 2</span>
            </div>
            <span className="text-sm text-blue-900">£{Number(vatReturn.box3).toFixed(2)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Box 4</span>
              <span className="text-slate-500 block">VAT reclaimed in the period on purchases and other inputs</span>
            </div>
            <span className="font-bold text-sm text-slate-900">£{Number(vatReturn.box4).toFixed(2)}</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300 flex items-center justify-between font-bold">
            <div>
              <span className="text-emerald-900 text-sm">
                Box 5 ({isPayable ? 'Net VAT Payable to HMRC' : 'Net VAT Reclaimable from HMRC'})
              </span>
              <span className="text-emerald-700 font-normal block">Difference between Box 3 and Box 4</span>
            </div>
            <span className="text-xl text-emerald-900">£{Math.abs(netPayable).toFixed(2)}</span>
          </div>

          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Box 6</span>
                <span className="text-slate-500 block">Total value of sales ex VAT (whole pounds)</span>
              </div>
              <span className="font-bold text-slate-900">£{Math.trunc(Number(vatReturn.box6)).toLocaleString('en-GB')}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Box 7</span>
                <span className="text-slate-500 block">Total value of purchases ex VAT (whole pounds)</span>
              </div>
              <span className="font-bold text-slate-900">£{Math.trunc(Number(vatReturn.box7)).toLocaleString('en-GB')}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Box 8</span>
                <span className="text-slate-500 block">Total value of EC goods supplied ex VAT</span>
              </div>
              <span className="font-bold text-slate-900">£{Math.trunc(Number(vatReturn.box8)).toLocaleString('en-GB')}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Box 9</span>
                <span className="text-slate-500 block">Total value of EC acquisitions ex VAT</span>
              </div>
              <span className="font-bold text-slate-900">£{Math.trunc(Number(vatReturn.box9)).toLocaleString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXPLICIT SUBMISSION CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck size={20} className="text-emerald-400" />
                <h3 className="font-bold text-sm">HMRC VAT Return Confirmation</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Period Key:</span>
                  <strong className="text-slate-900">{vatReturn.periodKey}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Net Liability (Box 5):</span>
                  <strong className="text-emerald-700">£{Math.abs(netPayable).toFixed(2)}</strong>
                </div>
              </div>

              <div
                onClick={() => setDeclarationConfirmed(!declarationConfirmed)}
                className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer flex items-start space-x-3 transition-colors"
              >
                {declarationConfirmed ? (
                  <CheckSquare size={18} className="text-blue-600 shrink-0 mt-0.5" />
                ) : (
                  <Square size={18} className="text-slate-400 shrink-0 mt-0.5" />
                )}
                <p className="text-[11px] text-slate-700 select-none">
                  <strong>Legal Declaration:</strong> I declare that the information provided in this return is complete and correct to the best of my knowledge and belief, in accordance with the provisions of the Value Added Tax Act 1994 and Making Tax Digital.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!declarationConfirmed || submitting}
                  onClick={handleSubmitToHmrc}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-xs disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Confirm & Submit to HMRC'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
