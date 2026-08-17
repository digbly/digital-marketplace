import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { StorefrontLayout } from './components/layout/StorefrontLayout';
import { VendorLayout } from './components/layout/VendorLayout';
import { AdminPortalLayout } from './components/layout/AdminPortalLayout';

// Storefront & Buyer Views
import { HomeView } from './views/storefront/HomeView';
import { BrowseProductsView } from './views/storefront/BrowseProductsView';
import { ProductDetailView } from './views/storefront/ProductDetailView';
import { CartCheckoutView } from './views/storefront/CartCheckoutView';
import { BuyerLibraryView } from './views/buyer/BuyerLibraryView';

// Vendor Views
import { VendorDashboardView } from './views/vendor/VendorDashboardView';
import { VendorProductsView } from './views/vendor/VendorProductsView';
import { VendorProductEditView } from './views/vendor/VendorProductEditView';
import { VendorOrdersView } from './views/vendor/VendorOrdersView';
import { VendorWalletView } from './views/vendor/VendorWalletView';
import { VendorSettingsView } from './views/vendor/VendorSettingsView';

// Admin Views
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminVendorsView } from './views/admin/AdminVendorsView';
import { AdminProductsView } from './views/admin/AdminProductsView';
import { AdminPayoutsView } from './views/admin/AdminPayoutsView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Storefront & Buyer Routes */}
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomeView />} />
            <Route path="/browse" element={<BrowseProductsView />} />
            <Route path="/products/:slug" element={<ProductDetailView />} />
            <Route path="/checkout" element={<CartCheckoutView />} />
            <Route path="/buyer/library" element={<BuyerLibraryView />} />
          </Route>

          {/* Vendor Portal Routes */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboardView />} />
            <Route path="products" element={<VendorProductsView />} />
            <Route path="products/new" element={<VendorProductEditView />} />
            <Route path="orders" element={<VendorOrdersView />} />
            <Route path="wallet" element={<VendorWalletView />} />
            <Route path="settings" element={<VendorSettingsView />} />
          </Route>

          {/* Super Admin Portal Routes */}
          <Route path="/admin" element={<AdminPortalLayout />}>
            <Route index element={<AdminDashboardView />} />
            <Route path="vendors" element={<AdminVendorsView />} />
            <Route path="products" element={<AdminProductsView />} />
            <Route path="payouts" element={<AdminPayoutsView />} />
            <Route path="settings" element={<AdminSettingsView />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
