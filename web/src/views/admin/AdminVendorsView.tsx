import React from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const AdminVendorsView: React.FC = () => {
  const { vendors, updateVendorStatus } = useMarketplaceStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Store Management & KYC</h1>
        <p className="text-xs text-slate-400 mt-1">Approve, moderate, or configure custom commission rates</p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
            <tr>
              <th className="py-3.5 px-4">Vendor Store</th>
              <th className="py-3.5 px-4">Owner User</th>
              <th className="py-3.5 px-4">Platform Fee (%)</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-slate-800/50 transition">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img src={vendor.logo_url || ''} alt={vendor.store_name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <span className="font-bold text-white block text-sm">{vendor.store_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{vendor.slug}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div>
                    <span className="font-semibold text-slate-200 block">{vendor.user?.name || 'Store Owner'}</span>
                    <span className="text-[11px] text-slate-400">{vendor.user?.email || 'owner@domain.com'}</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="font-bold text-amber-400">{vendor.commission_rate || 15}%</span>
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      vendor.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : vendor.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>

                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {vendor.status !== 'approved' && (
                      <button
                        onClick={() => updateVendorStatus(vendor.id, 'approved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {vendor.status !== 'suspended' && (
                      <button
                        onClick={() => updateVendorStatus(vendor.id, 'suspended')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
