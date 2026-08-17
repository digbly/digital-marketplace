import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  Search,
  ShoppingCart,
  DownloadCloud,
  ChevronDown,
  Layers,
  Sparkles,
  X,
  Trash2,
  ArrowRight,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAppSelector } from '../../store/hooks';
import { useLogoutMutation } from '../../store/services/authApi';
import type { UserRole } from '../../types/marketplace';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

  const {
    activeRole,
    switchRole,
    cart,
    removeFromCart,
    getCartTotal,
    categories,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
  } = useMarketplaceStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Ignore
    } finally {
      setIsUserMenuOpen(false);
      navigate('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/browse');
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setIsCategoryOpen(false);
    navigate('/browse');
  };

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsUserMenuOpen(false);
    if (role === 'vendor') {
      navigate('/vendor');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top utility banner for quick portal switching */}
      <div className="bg-gradient-to-r from-indigo-900/50 via-purple-900/50 to-slate-900 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">Digital Asset Multi-Vendor Marketplace</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Instant Download & License Key Activation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-xs hidden md:inline">Switch Perspective:</span>
          <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                activeRole === 'customer'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛍️ Storefront
            </button>
            <button
              onClick={() => handleRoleSwitch('vendor')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                activeRole === 'vendor'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💼 Vendor Portal
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                activeRole === 'admin'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Super Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
              DigiStore
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 ml-1.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PRO
            </span>
          </div>
        </Link>

        {/* Categories Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Categories</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setIsCategoryOpen(false);
                  navigate('/browse');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
              >
                All Digital Categories
              </button>
              <div className="h-px bg-slate-800 my-1" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg hidden sm:block relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, UI kits, boilerplates, software licenses..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </form>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Buyer Library Link */}
          <Link
            to="/buyer/library"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">My Purchases</span>
          </Link>

          {/* Cart Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Cart Flyout */}
            {isCartOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 text-slate-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-sm">Your Cart ({cart.length})</span>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-sm">Your cart is empty.</p>
                    <Link
                      to="/browse"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:underline"
                    >
                      Browse Digital Products →
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/60">
                          <img
                            src={item.product.thumbnail_url || ''}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-700 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-slate-200 truncate">{item.product.name}</h4>
                            <p className="text-xs font-bold text-indigo-400">${item.product.effective_price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-slate-400">Total:</span>
                        <span className="text-lg font-bold text-white">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <Link
                        to="/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account / Login Buttons */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs border border-indigo-500/40">
                  {authUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {authUser?.name || 'My Account'}
                  </div>
                  <div className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                    Vendor / User
                  </div>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-white truncate">{authUser?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{authUser?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/buyer/library"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <DownloadCloud className="w-4 h-4 text-emerald-400" />
                      My Digital Library
                    </Link>
                    <Link
                      to="/vendor"
                      onClick={() => {
                        switchRole('vendor');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Store className="w-4 h-4 text-purple-400" />
                      Vendor Dashboard
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => {
                        switchRole('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Super Admin Portal
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/auth/register"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
