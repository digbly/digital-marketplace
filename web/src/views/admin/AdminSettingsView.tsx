import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [defaultCommission, setDefaultCommission] = useState(15);
  const [escrowDays, setEscrowDays] = useState(7);
  const [minPayout, setMinPayout] = useState(50);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Global Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">Configure global commission rates, escrow buffer, and payout thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings saved successfully!</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Default Marketplace Platform Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={defaultCommission}
              onChange={(e) => setDefaultCommission(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Deducted automatically upon each completed order.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Escrow Holding Duration (Days)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={escrowDays}
              onChange={(e) => setEscrowDays(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Time before order revenue transfers from Holding to Available.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Minimum Payout Threshold ($)
            </label>
            <input
              type="number"
              min="10"
              value={minPayout}
              onChange={(e) => setMinPayout(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
