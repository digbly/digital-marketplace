import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { LanguageSwitcher } from './LanguageSwitcher';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

export const AdminPortalLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: t('admin.nav.overview'),
      items: [
        { label: t('admin.nav.dashboard'), to: '/admin', icon: LayoutDashboard, end: true },
      ],
    },
    {
      group: t('admin.nav.management'),
      items: [
        { label: t('admin.nav.vendorApprovals'), to: '/admin/vendors', icon: UserCheck },
        { label: t('admin.nav.productModeration'), to: '/admin/products', icon: Package },
        { label: t('admin.nav.payoutRequests'), to: '/admin/payouts', icon: DollarSign },
      ],
    },
    {
      group: t('admin.nav.configuration'),
      items: [
        { label: t('admin.nav.platformSettings'), to: '/admin/settings', icon: Cog },
      ],
    },
  ];

  const getPageTitle = (pathname: string): string => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if ('end' in item && item.end ? pathname === item.to : pathname.startsWith(item.to)) {
          return item.label;
        }
      }
    }
    return t('admin.panel');
  };

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
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  const pageTitle = getPageTitle(location.pathname);

  const renderSidebarContent = (onCloseMobile?: () => void) => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80">
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">{t('admin.panel')}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SUPER
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{t('admin.controlCenter')}</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
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
            <div className="text-[11px] text-amber-400/80 font-medium">{t('admin.platformAdmin')}</div>
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
            <span>{t('admin.backToStorefront')}</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col flex-shrink-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full">
            {renderSidebarContent(() => setIsMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm">
              <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition font-medium">
                {t('nav.roles.admin')}
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
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-amber-500/20">
                  {adminInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Super Admin'}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{t('admin.platformAdmin')}</div>
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
                      {t('admin.nav.platformSettings')}
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/60 transition"
                    >
                      <Globe className="w-4 h-4" />
                      {t('admin.backToStorefront')}
                    </Link>
                    <div className="border-t border-slate-700/60 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
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
