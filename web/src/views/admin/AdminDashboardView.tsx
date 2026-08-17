import React from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  useGetAdminAnalyticsQuery,
  useGetAdminVendorsQuery,
  useGetAdminPayoutsQuery,
} from '../../store/services/adminApi';

export const AdminDashboardView: React.FC = () => {
  const { data: analyticsRes, isLoading: isAnalyticsLoading, error: analyticsError } = useGetAdminAnalyticsQuery();
  const { data: vendorsRes, isLoading: isVendorsLoading } = useGetAdminVendorsQuery({ per_page: 5 });
  const { data: payoutsRes, isLoading: isPayoutsLoading } = useGetAdminPayoutsQuery({ per_page: 5 });

  const analytics = analyticsRes?.data;
  const vendors = vendorsRes?.data || [];
  const payouts = payoutsRes?.data || [];

  if (isAnalyticsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading platform analytics...</p>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-bold">Failed to load analytics data</h3>
          <p className="text-xs text-rose-400/80 mt-0.5">Please check your connection or permissions and try again.</p>
        </div>
      </div>
    );
  }

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
          <div className="text-2xl font-extrabold text-white">
            ${(analytics?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">Total platform sales</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform Commission Revenue</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            ${(analytics?.total_commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/80 font-medium">Marketplace retained profit</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Creators & Vendors</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{analytics?.total_vendors ?? 0} Vendors</div>
          <div className="text-[11px] text-purple-400 font-medium">{analytics?.total_buyers ?? 0} Registered Buyers</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Products & Orders</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{analytics?.total_orders ?? 0} Orders</div>
          <div className="text-[11px] text-slate-400">{analytics?.total_products ?? 0} Active Products</div>
        </div>
      </div>

      {/* Fast Action Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendors Overview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Registered Vendors</h2>
            <Link to="/admin/vendors" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {isVendorsLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">Loading vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No vendors registered yet.</div>
            ) : (
              vendors.slice(0, 5).map((v) => (
                <div key={v.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                      alt={v.store_name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{v.store_name}</h4>
                      <p className="text-[10px] text-slate-400">Rate: {v.commission_rate ?? 15}% Fee</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : v.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payout Requests */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Payout Requests</h2>
            <Link to="/admin/payouts" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {isPayoutsLoading ? (
              <div className="py-4 text-center text-xs text-slate-500">Loading payout requests...</div>
            ) : payouts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">No payout requests submitted.</div>
            ) : (
              payouts.slice(0, 5).map((pay) => (
                <div key={pay.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">
                      ${Number(pay.amount).toFixed(2)} to {pay.vendor?.store_name || 'Vendor'}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{pay.payout_method?.replace('_', ' ')}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      pay.status === 'processed' || pay.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : pay.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {pay.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      {analytics?.recent_orders && analytics.recent_orders.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Platform Orders</h2>
            <span className="text-xs text-slate-400">{analytics.recent_orders.length} latest transactions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {analytics.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{order.order_number}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-slate-200 block">{order.buyer?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400">{order.buyer?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${Number(order.total_amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 uppercase text-slate-400 text-[11px]">{order.payment_method}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
