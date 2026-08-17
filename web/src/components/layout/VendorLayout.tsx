import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Wallet,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  useGetVendorProfileQuery,
  useGetVendorWalletQuery,
} from '../../store/services/vendorApi';

export const VendorLayout: React.FC = () => {
  const { data: profileResponse, isLoading: isProfileLoading } = useGetVendorProfileQuery();
  const { data: walletResponse, isLoading: isWalletLoading } = useGetVendorWalletQuery();

  const vendor = profileResponse?.data;
  const wallet = walletResponse?.data;

  const navItems = [
    { label: 'Overview', to: '/vendor', icon: LayoutDashboard, end: true },
    { label: 'Products Catalog', to: '/vendor/products', icon: Package },
    { label: 'Upload Asset', to: '/vendor/products/new', icon: PlusCircle },
    { label: 'Sales & Orders', to: '/vendor/orders', icon: ShoppingBag },
    { label: 'Earnings & Wallet', to: '/vendor/wallet', icon: Wallet },
    { label: 'Store Profile', to: '/vendor/settings', icon: Store },
  ];

  const storeInitials = vendor?.store_name
    ? vendor.store_name.slice(0, 2).toUpperCase()
    : 'VS';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sticky top-24 space-y-6">
            {/* Store Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20">
              <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 font-bold overflow-hidden">
                {vendor?.logo_url ? (
                  <img
                    src={vendor.logo_url}
                    alt={vendor.store_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  storeInitials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                  Vendor Store
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {isProfileLoading ? 'Loading...' : vendor?.store_name || 'My Digital Store'}
                </div>
              </div>
            </div>

            {/* Quick Wallet Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-medium">Available to Withdraw</div>
              <div className="text-xl font-bold text-white mt-1">
                {isWalletLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                ) : (
                  `$${(wallet?.balance || 0).toFixed(2)}`
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <span>Holding in Escrow:</span>
                <span className="text-amber-400 font-semibold">
                  ${(wallet?.holding_balance || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-800">
              <a
                href="/"
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-indigo-400 transition"
              >
                <span>View Public Storefront</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
