import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Wallet } from 'lucide-react';

export const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiFetch(`/suppliers/${id}`).then((res) => {
        if (res.success && res.data) {
          setSupplier(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 text-xs">Loading supplier details...</div>;
  if (!supplier) return <div className="p-8 text-center text-red-500 text-xs">Supplier not found</div>;

  return (
    <div className="space-y-6">
      <Link to="/suppliers" className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={16} />
        <span>Back to Suppliers</span>
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{supplier.name}</h2>
          {supplier.companyName && <p className="text-sm font-medium text-slate-500 mt-1">{supplier.companyName}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            {supplier.email && (
              <span className="flex items-center space-x-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>{supplier.email}</span>
              </span>
            )}
            {supplier.phone && (
              <span className="flex items-center space-x-1.5">
                <Phone size={14} className="text-slate-400" />
                <span>{supplier.phone}</span>
              </span>
            )}
            {supplier.postcode && (
              <span className="flex items-center space-x-1.5">
                <MapPin size={14} className="text-slate-400" />
                <span>{supplier.address}, {supplier.postcode}</span>
              </span>
            )}
            {supplier.vatNumber && (
              <span className="flex items-center space-x-1.5 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                <span>VAT: {supplier.vatNumber}</span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right min-w-[200px]">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Recorded Expenses</span>
          <span className="text-2xl font-bold text-slate-900">
            £{Number(supplier.totalExpenses).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Supplier Expenses ({supplier.expenses?.length || 0})</h3>

        {supplier.expenses?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No expenses recorded for this supplier yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Net Amount</th>
                  <th className="py-2.5 px-4 text-right">VAT</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplier.expenses?.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {new Date(exp.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">{exp.category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{exp.description}</td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(exp.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">£{Number(exp.vatAmount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">£{Number(exp.total).toFixed(2)}</td>
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
