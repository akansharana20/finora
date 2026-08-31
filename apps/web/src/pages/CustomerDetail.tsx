import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Receipt, AlertCircle, Plus } from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiFetch(`/customers/${id}`).then((res) => {
        if (res.success && res.data) {
          setCustomer(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500 text-xs">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/customers" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} />
        <span>Back to Customers</span>
      </Link>

      {/* Customer Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {customer.status}
            </span>
          </div>
          {customer.companyName && (
            <p className="text-sm font-medium text-slate-500 mt-1">{customer.companyName}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            {customer.email && (
              <span className="flex items-center space-x-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>{customer.email}</span>
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center space-x-1.5">
                <Phone size={14} className="text-slate-400" />
                <span>{customer.phone}</span>
              </span>
            )}
            {customer.postcode && (
              <span className="flex items-center space-x-1.5">
                <MapPin size={14} className="text-slate-400" />
                <span>{customer.address}, {customer.postcode}</span>
              </span>
            )}
            {customer.vatNumber && (
              <span className="flex items-center space-x-1.5 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                <span>VAT: {customer.vatNumber}</span>
              </span>
            )}
          </div>
        </div>

        {/* Outstanding Balance KPI Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right min-w-[200px]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Outstanding Balance</span>
          <span className={`text-2xl font-bold ${customer.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            £{Number(customer.outstandingBalance).toFixed(2)}
          </span>
          <Link
            to={`/invoices/new?customerId=${customer.id}`}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded text-xs inline-flex items-center space-x-1 shadow-xs"
          >
            <Plus size={14} />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Customer Invoices History */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Customer Invoices ({customer.invoices?.length || 0})</h3>

        {customer.invoices?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No invoices issued to this customer yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Issue Date</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">
                      <Link to={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.issueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-800'
                            : inv.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      £{Number(inv.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      £{Number(inv.balanceDue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
