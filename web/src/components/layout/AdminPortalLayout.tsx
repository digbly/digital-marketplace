import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Package,
  DollarSign,
  Cog,
  ShieldCheck,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ChevronDown,
  Globe,
  Bell,
} from 'lucide-react';

import { useAppSelector } from '../../store/hooks';
import { useLogoutMutation } from '../../store/services/authApi';
import type { AuthUser } from '../../types/auth';
import { LanguageSwitcher } from './LanguageSwitcher';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    ],
  },
  {
    group: 'Management',
    items: [
      { label: 'Vendor Approvals', to: '/admin/vendors', icon: UserCheck },
      { label: 'Product Moderation', to: '/admin/products', icon: Package },
      { label: 'Payout Requests', to: '/admin/payouts', icon: DollarSign },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { label: 'Platform Settings', to: '/admin/settings', icon: Cog },
    ],
  },
];

function getPageTitle(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if ('end' in item && item.end ? pathname === item.to : pathname.startsWith(item.to)) {
        return item.label;
      }
    }
  }
  return 'Admin Portal';
}

const SidebarContent = React.memo(function SidebarContent({
  user,
  adminInitials,
  onCloseMobile,
}: {
  user: AuthUser | null;
  adminInitials: string;
  onCloseMobile?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80">
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">Admin Panel</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUPER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Platform Control Center</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/15">
          <div className="w-9 h-9 rounded-lg bg-amber-600/25 border border-amber-400/30 flex items-center justify-center text-amber-300 text-xs font-bold">
            {adminInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">{user?.name || 'Super Admin'}</div>
            <div className="text-[11px] text-amber-400/80 font-medium">Platform Administrator</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={'end' in item ? item.end : undefined}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/80">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4" />
            <span>Back to Storefront</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
});

export const AdminPortalLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Intentionally silent — logout should always proceed
    } finally {
      setIsUserDropdownOpen(false);
      navigate('/');
    }
  };

  const adminInitials = user?.name
    ? user.name.slice(0, 2).toUpperCase()
    : 'SA';

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <aside className="hidden md:flex md:w-72 lg:w-72 flex-shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent user={user} adminInitials={adminInitials} />
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 flex flex-col">
            <SidebarContent
              user={user}
              adminInitials={adminInitials}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition font-medium">
                Admin
              </Link>
              {location.pathname !== '/admin' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-white font-semibold">{pageTitle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />

            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-amber-500/20">
                  {adminInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Super Admin'}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Administrator</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-700/60">
                      <div className="text-sm font-bold text-white">{user?.name || 'Super Admin'}</div>
                      <div className="text-[11px] text-slate-400">{user?.email || 'admin@digistore.com'}</div>
                    </div>
                    <Link
                      to="/admin/settings"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                    >
                      <Cog className="w-4 h-4" />
                      Platform Settings
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                    >
                      <Globe className="w-4 h-4" />
                      View Storefront
                    </Link>
                    <div className="border-t border-slate-700/60 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
