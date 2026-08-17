import React, { useState } from 'react';
import {
  ArrowUpRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';

export const VendorWalletView: React.FC = () => {
  const { vendorWallet, requestPayout } = useMarketplaceStore();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(vendorWallet.balance > 0 ? vendorWallet.balance : 100);
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [accountDetails, setAccountDetails] = useState('Chase Bank (•••• 8821)');

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount > vendorWallet.balance) {
      alert('Withdrawal amount cannot exceed available balance.');
      return;
    }

    requestPayout(payoutAmount, payoutMethod, { details: accountDetails });
    setIsPayoutModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Earnings & Vendor Wallet</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your store balances, sales payouts, and transaction history
          </p>
        </div>

        <button
          onClick={() => setIsPayoutModalOpen(true)}
          disabled={vendorWallet.balance <= 0}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/20 space-y-2">
          <span className="text-xs font-semibold text-purple-300">Available Balance</span>
          <div className="text-3xl font-extrabold text-white">${vendorWallet.balance.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Available for withdrawal to bank/PayPal</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-amber-400">Escrow Holding Period</span>
          <div className="text-3xl font-extrabold text-amber-400">${vendorWallet.holding_balance.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Holding buffer for customer refunds/disputes</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-emerald-400">Lifetime Gross Earned</span>
          <div className="text-3xl font-extrabold text-white">${vendorWallet.total_earned.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Total net revenue after platform fee</p>
        </div>
      </div>

      {/* Ledger Transactions */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Full Transaction Ledger</h2>

        <div className="divide-y divide-slate-800 text-xs">
          {(!vendorWallet.transactions || vendorWallet.transactions.length === 0) ? (
            <p className="py-8 text-center text-slate-500">No transactions recorded yet.</p>
          ) : (
            vendorWallet.transactions.map((txn) => (
              <div key={txn.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-slate-200 text-sm">{txn.description}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="capitalize">{txn.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(txn.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-base font-extrabold ${txn.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {txn.amount > 0 ? `+$${txn.amount.toFixed(2)}` : `-$${Math.abs(txn.amount).toFixed(2)}`}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    Balance: ${txn.balance_after.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Request Payout Withdrawal</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Withdrawal Amount ($) (Max: ${vendorWallet.balance.toFixed(2)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max={vendorWallet.balance}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="bank_transfer" className="bg-slate-900 text-white">Direct Wire Bank Transfer</option>
                  <option value="paypal" className="bg-slate-900 text-white">PayPal Express</option>
                  <option value="crypto" className="bg-slate-900 text-white">USDT / USDC Crypto Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Payout Account Details</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  required
                  placeholder="Account Number, IBAN or PayPal Email"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>Payouts are reviewed and settled by Super Admin within 24-48 business hours.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
