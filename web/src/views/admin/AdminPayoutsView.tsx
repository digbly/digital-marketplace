import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Check,
  XCircle,
} from 'lucide-react';
import {
  useGetAdminPayoutsQuery,
  useProcessPayoutMutation,
} from '../../store/services/adminApi';
import { getErrorMessage } from '../../utils/apiError';
import type { PayoutRequest } from '../../types/marketplace';

export const AdminPayoutsView: React.FC = () => {
  const { data: payoutsRes, isLoading, isFetching, error, refetch } = useGetAdminPayoutsQuery();
  const [processPayout, { isLoading: isProcessing }] = useProcessPayoutMutation();

  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const payouts = payoutsRes?.data || [];

  const handleProcess = async (
    payout: PayoutRequest,
    status: 'processed' | 'rejected' | 'approved',
    adminNote?: string
  ) => {
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
    try {
      await processPayout({
        id: payout.id,
        status,
        admin_note: adminNote || (status === 'processed' ? 'Transferred by Admin' : 'Declined by Admin'),
      }).unwrap();

      setActionSuccessMessage(`Payout request #${payout.id.slice(0, 8)} marked as ${status.toUpperCase()}.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: unknown) {
      setActionErrorMessage(getErrorMessage(err, 'Failed to process payout request.'));
      setTimeout(() => setActionErrorMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Vendor Payouts & Settlement</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review withdrawal requests, verify payout accounts, and release funds
          </p>
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
            <p className="text-xs text-slate-400">Loading payout requests...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-bold text-white">Could not fetch payout queue</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500"
            >
              Retry
            </button>
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No withdrawal requests pending in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Vendor Store</th>
                  <th className="py-3.5 px-4">Requested Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Account Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Settlement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {payouts.map((payout) => {
                  const accountDetailsStr = payout.payout_account_details
                    ? typeof payout.payout_account_details === 'string'
                      ? payout.payout_account_details
                      : JSON.stringify(payout.payout_account_details).replace(/["{}]/g, '')
                    : 'N/A';

                  return (
                    <tr key={payout.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4 font-bold text-white">
                        {payout.vendor?.store_name || `Vendor #${payout.vendor_id?.slice(0, 6)}`}
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-base font-extrabold text-emerald-400">
                          ${Number(payout.amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-4 capitalize font-semibold text-slate-200">
                        {payout.payout_method ? payout.payout_method.replace('_', ' ') : 'Bank Transfer'}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-slate-400 max-w-[200px] truncate">
                        {accountDetailsStr}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            payout.status === 'processed' || payout.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : payout.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {payout.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={isProcessing}
                              onClick={() => handleProcess(payout, 'processed', 'Transferred by Admin')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Pay</span>
                            </button>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleProcess(payout, 'rejected', 'Declined by Admin')}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
