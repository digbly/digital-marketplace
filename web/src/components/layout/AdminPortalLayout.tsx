import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  BarChart3,
  Users,
  CheckSquare,
  CreditCard,
  Settings,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export const AdminPortalLayout: React.FC = () => {
  const navItems = [
    { label: 'Platform Analytics', to: '/admin', icon: BarChart3, end: true },
    { label: 'Vendor Approvals', to: '/admin/vendors', icon: Users },
    { label: 'Product Moderation', to: '/admin/products', icon: CheckSquare },
    { label: 'Payout Requests', to: '/admin/payouts', icon: CreditCard },
    { label: 'Platform Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sticky top-24 space-y-6">
            {/* Admin Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/20">
              <div className="w-10 h-10 rounded-lg bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Control Plane</div>
                <div className="text-sm font-bold text-white truncate">Super Admin</div>
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
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
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
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-amber-400 transition"
              >
                <span>Back to Storefront</span>
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
