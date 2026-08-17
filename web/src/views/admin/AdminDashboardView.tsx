import React from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const AdminDashboardView: React.FC = () => {
  const { vendors, payoutRequests } = useMarketplaceStore();

  const totalGMV = 43300.00;
  const platformCommission = 6495.00; // ~15%
  const pendingPayoutsCount = payoutRequests.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Super Admin Control Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Marketplace-wide governance, commission revenue, vendor verification, and payout processing
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Marketplace Volume (GMV)</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">${totalGMV.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-medium">+24.8% vs last month</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Commission Revenue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">${platformCommission.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400/80 font-medium">Avg 15.0% platform fee</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Creators & Stores</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{vendors.length} Vendors</div>
          <div className="text-[11px] text-purple-400 font-medium">100% verified KYC</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Payouts Queue</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{pendingPayoutsCount} Requests</div>
          <div className="text-[11px] text-slate-400">Needs admin approval</div>
        </div>
      </div>

      {/* Fast Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendors Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Registered Vendors</h2>
          <div className="divide-y divide-slate-800">
            {vendors.map((v) => (
              <div key={v.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={v.logo_url || ''} alt={v.store_name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{v.store_name}</h4>
                    <p className="text-[10px] text-slate-400">Rate: {v.commission_rate || 15}% Fee</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payout Requests */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Recent Payout Requests</h2>
          <div className="divide-y divide-slate-800">
            {payoutRequests.map((pay) => (
              <div key={pay.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">${pay.amount.toFixed(2)} to {pay.vendor?.store_name}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{pay.payout_method.replace('_', ' ')}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    pay.status === 'processed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {pay.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
