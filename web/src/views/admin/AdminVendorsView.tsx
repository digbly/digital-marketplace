import React, { useState } from 'react';
import {
  ShieldCheck,
  Ban,
  Percent,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  useGetAdminVendorsQuery,
  useUpdateVendorStatusMutation,
} from '../../store/services/adminApi';
import { getErrorMessage } from '../../utils/apiError';
import type { Vendor } from '../../types/marketplace';

export const AdminVendorsView: React.FC = () => {
  const { data: vendorsRes, isLoading, isFetching, error, refetch } = useGetAdminVendorsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateVendorStatusMutation();

  const [editingRateVendorId, setEditingRateVendorId] = useState<string | null>(null);
  const [customRate, setCustomRate] = useState<number>(15);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const vendors = vendorsRes?.data || [];

  const handleStatusChange = async (
    vendor: Vendor,
    status: 'approved' | 'suspended' | 'pending' | 'rejected',
    commissionRate?: number
  ) => {
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    try {
      await updateStatus({
        id: vendor.id,
        status,
        commission_rate: commissionRate !== undefined ? commissionRate : (vendor.commission_rate ?? 15),
      }).unwrap();

      setActionSuccessMessage(`Updated store status for "${vendor.store_name}" to ${status.toUpperCase()}.`);
      setEditingRateVendorId(null);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setActionErrorMessage(getErrorMessage(err, 'Failed to update vendor status.'));
      setTimeout(() => setActionErrorMessage(null), 4000);
    }
  };

  const handleSaveCommissionRate = async (vendor: Vendor) => {
    await handleStatusChange(vendor, vendor.status, customRate);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Vendor Store Management & KYC</h1>
          <p className="text-xs text-slate-400 mt-1">Approve, moderate, or configure custom commission rates</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionErrorMessage}</span>
        </div>
      )}

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
            <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
            <p className="text-xs text-slate-400">Loading vendor records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-white">Could not fetch vendor directory</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No registered vendors found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                        <img
                          src={vendor.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                          alt={vendor.store_name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{vendor.store_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">/{vendor.slug}</span>
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
                      {editingRateVendorId === vendor.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customRate}
                            onChange={(e) => setCustomRate(Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-amber-500/50 text-white font-bold text-xs"
                          />
                          <button
                            onClick={() => handleSaveCommissionRate(vendor)}
                            disabled={isUpdating}
                            className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRateVendorId(null)}
                            className="px-1.5 py-1 text-slate-400 text-[11px] hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400">{vendor.commission_rate ?? 15}%</span>
                          <button
                            onClick={() => {
                              setEditingRateVendorId(vendor.id);
                              setCustomRate(vendor.commission_rate ?? 15);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-amber-300 hover:bg-slate-800"
                            title="Edit commission fee"
                          >
                            <Percent className="w-3 h-3" />
                          </button>
                        </div>
                      )}
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
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(vendor, 'approved')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        {vendor.status !== 'suspended' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(vendor, 'suspended')}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
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
