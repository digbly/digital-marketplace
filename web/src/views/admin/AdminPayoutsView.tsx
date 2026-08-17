import React from 'react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const AdminPayoutsView: React.FC = () => {
  const { payoutRequests, updatePayoutStatus } = useMarketplaceStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Vendor Payouts & Settlement</h1>
        <p className="text-xs text-slate-400 mt-1">Review withdrawal requests, verify payout accounts, and release funds</p>
      </div>

      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
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
            {payoutRequests.map((payout) => (
              <tr key={payout.id} className="hover:bg-slate-800/50 transition">
                <td className="py-4 px-4 font-bold text-white">
                  {payout.vendor?.store_name || 'Vendor #1'}
                </td>

                <td className="py-4 px-4">
                  <span className="text-base font-extrabold text-emerald-400">${payout.amount.toFixed(2)}</span>
                </td>

                <td className="py-4 px-4 capitalize font-semibold text-slate-200">
                  {payout.payout_method.replace('_', ' ')}
                </td>

                <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                  {JSON.stringify(payout.payout_account_details).replace(/["{}]/g, '')}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      payout.status === 'processed'
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
                        onClick={() => updatePayoutStatus(payout.id, 'processed', 'Transferred by Admin')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold"
                      >
                        Approve & Pay
                      </button>
                      <button
                        onClick={() => updatePayoutStatus(payout.id, 'rejected', 'Declined by Admin')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
