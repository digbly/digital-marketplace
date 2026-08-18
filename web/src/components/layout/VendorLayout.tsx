import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Wallet,
  ShoppingBag,
  Store,
  ArrowUpRight,
  Loader2,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  DollarSign,
  ChevronDown,
  Globe,
} from 'lucide-react';
import {
  useGetVendorProfileQuery,
  useGetVendorWalletQuery,
} from '../../store/services/vendorApi';
import { useAppSelector } from '../../store/hooks';
import { useLogoutMutation } from '../../store/services/authApi';
import { LanguageSwitcher } from './LanguageSwitcher';

export const VendorLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { data: profileResponse, isLoading: isProfileLoading } = useGetVendorProfileQuery();
  const { data: walletResponse, isLoading: isWalletLoading } = useGetVendorWalletQuery();

  const vendor = profileResponse?.data;
  const wallet = walletResponse?.data;

  const navGroups = [
    {
      group: t('vendor.nav.overview'),
      items: [
        { label: t('vendor.nav.overview'), to: '/vendor', icon: LayoutDashboard, end: true },
      ],
    },
    {
      group: t('vendor.nav.catalogOrders'),
      items: [
        { label: t('vendor.nav.productsCatalog'), to: '/vendor/products', icon: Package, end: true },
        { label: t('vendor.uploadAsset'), to: '/vendor/products/new', icon: PlusCircle },
        { label: t('vendor.nav.ordersSales'), to: '/vendor/orders', icon: ShoppingBag },
      ],
    },
    {
      group: t('vendor.nav.financeSettings'),
      items: [
        { label: t('vendor.nav.earningsWallet'), to: '/vendor/wallet', icon: Wallet },
        { label: t('vendor.nav.storeSettings'), to: '/vendor/settings', icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Ignore errors
    } finally {
      setIsUserDropdownOpen(false);
      navigate('/');
    }
  };

  const storeInitials = vendor?.store_name
    ? vendor.store_name.slice(0, 2).toUpperCase()
    : 'VS';

  // Determine current page name for header breadcrumb
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    if (path === '/vendor') return t('vendor.nav.overview');
    if (path === '/vendor/products') return t('vendor.nav.productsCatalog');
    if (path === '/vendor/products/new') return t('vendor.uploadAsset');
    if (path === '/vendor/orders') return t('vendor.nav.ordersSales');
    if (path === '/vendor/wallet') return t('vendor.nav.earningsWallet');
    if (path === '/vendor/settings') return t('vendor.nav.storeSettings');
    return t('vendor.nav.overview');
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to="/vendor" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight">{t('vendor.hub')}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{t('vendor.managementPortal')}</p>
          </div>
        </Link>
        {isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Store Quick Profile Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold overflow-hidden shrink-0">
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
          <div className="text-xs font-bold text-white truncate">
            {isProfileLoading ? t('common.loading') : vendor?.store_name || 'My Digital Store'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-slate-400 truncate">{t('vendor.onlineActive')}</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.group}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Quick Wallet Widget in Sidebar */}
        <div className="pt-2">
          <div className="p-4 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-purple-400" /> {t('vendor.availableBalance')}
              </span>
              <Link
                to="/vendor/wallet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[10px] font-bold text-purple-400 hover:text-purple-300 hover:underline"
              >
                {t('vendor.withdraw')}
              </Link>
            </div>
            <div className="text-xl font-extrabold text-white">
              {isWalletLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              ) : (
                `$${(wallet?.balance || 0).toFixed(2)}`
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/60 text-slate-400">
              <span>{t('vendor.holdingEscrow')}:</span>
              <span className="text-amber-400 font-semibold">
                ${(wallet?.holding_balance || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/70 transition"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{t('vendor.viewStorefront')}</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Sticky Header Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Context */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">{t('nav.vendorPortal')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-white font-bold">{getCurrentPageTitle()}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />

            <Link
              to="/vendor/products/new"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('vendor.uploadAsset')}</span>
            </Link>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{t('vendor.marketplace')}</span>
            </Link>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs overflow-hidden">
                  {vendor?.logo_url ? (
                    <img
                      src={vendor.logo_url}
                      alt="Store Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    storeInitials
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user?.name || vendor?.store_name || 'Vendor Admin'}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {user?.email || 'vendor@portal.com'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <div className="font-bold text-white">{vendor?.store_name || 'My Store'}</div>
                      <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/vendor/settings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4" />
                        <span>{t('vendor.nav.storeSettings')}</span>
                      </Link>
                      <Link
                        to="/vendor/wallet"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>{t('vendor.nav.earningsWallet')}</span>
                      </Link>
                      <Link
                        to="/"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Globe className="w-4 h-4" />
                        <span>{t('vendor.viewStorefront')}</span>
                      </Link>
                    </div>
                    <div className="p-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
