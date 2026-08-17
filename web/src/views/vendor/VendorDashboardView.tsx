import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  PlusCircle,
  Clock,
  Wallet,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const VendorDashboardView: React.FC = () => {
  const { vendorWallet, vendorProducts } = useMarketplaceStore();

  const totalProducts = vendorProducts.length;
  const totalEarnings = vendorWallet.total_earned;
  const availableBalance = vendorWallet.balance;
  const holdingBalance = vendorWallet.holding_balance;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Vendor Portal Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your digital store analytics, sales revenue, and payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/vendor/products/new"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Asset</span>
          </Link>
          <Link
            to="/vendor/wallet"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition"
          >
            Withdraw Funds
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Available Balance</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${availableBalance.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400 font-medium">Ready for instant payout</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Escrow Holding</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">${holdingBalance.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400">Unlocks in 3 - 7 days</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Lifetime Gross Sales</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</div>
          <div className="text-[11px] text-purple-400 font-medium">+18.4% this month</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Published Products</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalProducts}</div>
          <div className="text-[11px] text-slate-400">Active in marketplace</div>
        </div>
      </div>

      {/* Your Store Products Preview */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Your Listed Digital Products</h2>
            <p className="text-xs text-slate-400">Manage files, license keys, and pricing</p>
          </div>
          <Link to="/vendor/products" className="text-xs font-semibold text-purple-400 hover:underline">
            View All ({vendorProducts.length}) →
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {vendorProducts.map((p) => (
            <div key={p.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.thumbnail_url || ''}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-emerald-400 font-semibold">${p.effective_price.toFixed(2)}</span>
                    <span>•</span>
                    <span>{p.total_sales} sales</span>
                    <span>•</span>
                    <span className="capitalize text-slate-500">{p.product_type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Published
                </span>
                <Link
                  to={`/vendor/products`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Earnings Activity */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Ledger Transactions</h2>
            <p className="text-xs text-slate-400">Order earnings and payout withdrawals</p>
          </div>
          <Link to="/vendor/wallet" className="text-xs font-semibold text-purple-400 hover:underline">
            Full Wallet History →
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {vendorWallet.transactions?.map((txn) => (
            <div key={txn.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-200">{txn.description}</p>
                <p className="text-[10px] text-slate-500">{new Date(txn.created_at).toLocaleString()}</p>
              </div>
              <span className={`font-bold ${txn.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {txn.amount > 0 ? `+$${txn.amount.toFixed(2)}` : `-$${Math.abs(txn.amount).toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
