import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';
import { supportedLanguages } from './i18n';

// Main Storefront Layout (Eager for instant storefront render)
import { StorefrontLayout } from './components/layout/StorefrontLayout';

// Subsystem Layouts (Lazy loaded for isolated portal chunks)
const VendorLayout = lazy(() => import('./components/layout/VendorLayout').then(m => ({ default: m.VendorLayout })));
const AdminPortalLayout = lazy(() => import('./components/layout/AdminPortalLayout').then(m => ({ default: m.AdminPortalLayout })));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout').then(m => ({ default: m.AuthLayout })));

// Auth Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';

// Lazy-loaded Views
const LoginView = lazy(() => import('./views/auth/LoginView').then(m => ({ default: m.LoginView })));
const RegisterView = lazy(() => import('./views/auth/RegisterView').then(m => ({ default: m.RegisterView })));
const ForgotPasswordView = lazy(() => import('./views/auth/ForgotPasswordView').then(m => ({ default: m.ForgotPasswordView })));
const ResetPasswordView = lazy(() => import('./views/auth/ResetPasswordView').then(m => ({ default: m.ResetPasswordView })));
const VerifyEmailView = lazy(() => import('./views/auth/VerifyEmailView').then(m => ({ default: m.VerifyEmailView })));

const HomeView = lazy(() => import('./views/storefront/HomeView').then(m => ({ default: m.HomeView })));
const BrowseProductsView = lazy(() => import('./views/storefront/BrowseProductsView').then(m => ({ default: m.BrowseProductsView })));
const ProductDetailView = lazy(() => import('./views/storefront/ProductDetailView').then(m => ({ default: m.ProductDetailView })));
const CartCheckoutView = lazy(() => import('./views/storefront/CartCheckoutView').then(m => ({ default: m.CartCheckoutView })));
const BuyerLibraryView = lazy(() => import('./views/buyer/BuyerLibraryView').then(m => ({ default: m.BuyerLibraryView })));

const VendorDashboardView = lazy(() => import('./views/vendor/VendorDashboardView').then(m => ({ default: m.VendorDashboardView })));
const VendorProductsView = lazy(() => import('./views/vendor/VendorProductsView').then(m => ({ default: m.VendorProductsView })));
const VendorProductEditView = lazy(() => import('./views/vendor/VendorProductEditView').then(m => ({ default: m.VendorProductEditView })));
const VendorOrdersView = lazy(() => import('./views/vendor/VendorOrdersView').then(m => ({ default: m.VendorOrdersView })));
const VendorWalletView = lazy(() => import('./views/vendor/VendorWalletView').then(m => ({ default: m.VendorWalletView })));
const VendorSettingsView = lazy(() => import('./views/vendor/VendorSettingsView').then(m => ({ default: m.VendorSettingsView })));

const AdminDashboardView = lazy(() => import('./views/admin/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const AdminVendorsView = lazy(() => import('./views/admin/AdminVendorsView').then(m => ({ default: m.AdminVendorsView })));
const AdminProductsView = lazy(() => import('./views/admin/AdminProductsView').then(m => ({ default: m.AdminProductsView })));
const AdminPayoutsView = lazy(() => import('./views/admin/AdminPayoutsView').then(m => ({ default: m.AdminPayoutsView })));
const AdminSettingsView = lazy(() => import('./views/admin/AdminSettingsView').then(m => ({ default: m.AdminSettingsView })));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Loading page...</span>
      </div>
    </div>
  );
}

function LanguageWrapper() {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const isSupported = lang ? supportedLanguages.some((l) => l.code === lang) : false;

  useEffect(() => {
    if (lang && isSupported && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, isSupported, i18n]);

  if (!lang || !isSupported) {
    const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
    const cleanPath = lang ? location.pathname.replace(`/${lang}`, '') : location.pathname;
    return <Navigate to={`/${currentLang}${cleanPath || ''}${location.search}${location.hash}`} replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  const targetPath = `/${currentLang}${location.pathname === '/' ? '' : location.pathname}${location.search}${location.hash}`;
  return <Navigate to={targetPath} replace />;
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/:lang" element={<LanguageWrapper />}>
              {/* Public Auth Routes */}
              <Route
                path="auth"
                element={
                  <PublicRoute>
                    <AuthLayout />
                  </PublicRoute>
                }
              >
                <Route path="login" element={<LoginView />} />
                <Route path="register" element={<RegisterView />} />
                <Route path="forgot-password" element={<ForgotPasswordView />} />
                <Route path="reset-password" element={<ResetPasswordView />} />
                <Route path="verify-email" element={<VerifyEmailView />} />
                <Route index element={<Navigate to="login" replace />} />
              </Route>

              {/* Public Storefront & Buyer Routes */}
              <Route element={<StorefrontLayout />}>
                <Route index element={<HomeView />} />
                <Route path="browse" element={<BrowseProductsView />} />
                <Route path="products/:slug" element={<ProductDetailView />} />
                <Route path="checkout" element={<CartCheckoutView />} />
                <Route path="buyer/library" element={<BuyerLibraryView />} />
              </Route>

              {/* Protected Vendor Portal Routes */}
              <Route
                path="vendor"
                element={
                  <ProtectedRoute>
                    <VendorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<VendorDashboardView />} />
                <Route path="products" element={<VendorProductsView />} />
                <Route path="products/new" element={<VendorProductEditView />} />
                <Route path="orders" element={<VendorOrdersView />} />
                <Route path="wallet" element={<VendorWalletView />} />
                <Route path="settings" element={<VendorSettingsView />} />
              </Route>

              {/* Super Admin Portal Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPortalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardView />} />
                <Route path="vendors" element={<AdminVendorsView />} />
                <Route path="products" element={<AdminProductsView />} />
                <Route path="payouts" element={<AdminPayoutsView />} />
                <Route path="settings" element={<AdminSettingsView />} />
              </Route>
            </Route>

            {/* Fallback & Root Redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

