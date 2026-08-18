---
title: "Vendor Admin Dashboard Layout Pattern"
date: "2026-08-18"
category: "architecture"
module: "vendor-portal"
problem_type: "architecture_pattern"
component: "ui_layout"
severity: "medium"
applies_when:
  - "Designing or refactoring vendor and administrative dashboards in React with full-screen shell, sticky sidebar, topbar breadcrumbs, and responsive mobile drawers"
tags:
  - "react"
  - "admin-layout"
  - "dashboard"
  - "vendor-portal"
  - "responsive-drawer"
  - "tailwind"
---

# Vendor Admin Dashboard Layout Pattern

## Context
When building a multi-vendor marketplace, embedding the Vendor Portal inside the storefront layout creates cognitive friction (competing header search bars, shopping cart icons) and limits usable screen real estate. Vendors require a focused, full-screen administrative shell (SaaS Admin Dashboard) with persistent sidebar navigation, live wallet stats, rapid quick-actions, and responsive mobile support.

## Solution Architecture

### 1. Full-Screen Dashboard Shell (`VendorLayout.tsx`)
Separates the admin portal completely from the public `<Navbar />`:
- **Desktop Sidebar (`hidden md:flex md:w-64 fixed inset-y-0`)**:
  - Brand header with Store Icon, "Vendor Hub" branding, and "PRO" badge.
  - Store Quick Profile pill displaying store logo/initials and active status.
  - Categorized navigation groups (`Overview`, `Catalog & Orders`, `Finance & Settings`) with active route styling.
  - Quick Wallet Balance card showing available balance, pending escrow, and withdraw CTA.
  - Footer actions: "View Public Storefront" and "Log Out".
- **Top Management Header (`sticky top-0 z-20 h-16`)**:
  - Hamburger toggle for mobile devices.
  - Dynamic breadcrumb context matching current `location.pathname`.
  - Quick actions ("+ Upload Asset", "Marketplace").
  - Account Profile dropdown with click-outside dismissal.
- **Mobile Responsive Drawer (`fixed inset-0 z-50 md:hidden`)**:
  - Backdrop overlay with slide-out sidebar navigation.

### 2. Implementation Seam
File: `web/src/components/layout/VendorLayout.tsx`

```tsx
export const VendorLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const { data: profileResponse } = useGetVendorProfileQuery();
  const { data: walletResponse } = useGetVendorWalletQuery();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl z-50">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile toggle, breadcrumb, quick CTAs, profile menu */}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

## Verification & Key Learnings
- Separating layout concerns avoids style bleed and keeps state management clean.
- Utilizing `location.pathname` for dynamic breadcrumb context removes redundant per-view breadcrumb logic.
- Building a pure Tailwind/CSS overlay drawer avoids heavy external modal dependencies.
