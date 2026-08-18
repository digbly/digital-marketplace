---
title: "Admin Portal Self-Contained Layout Pattern"
date: 2026-08-18
problem_type: "architecture"
area: "layout"
tags: ["react", "layout", "admin", "vendor", "pattern"]
status: "verified"
---

# Admin Portal Self-Contained Layout Pattern

## Problem

The original `AdminPortalLayout` used a shared `Navbar` component, which created an inconsistent admin experience compared to the self-contained `VendorLayout`. The admin portal needed a professional, dedicated layout with sidebar navigation, top bar, and mobile responsiveness.

## Solution

Rewrite `AdminPortalLayout` to be fully self-contained, following the `VendorLayout` pattern:

### Key Decisions

1. **Self-contained layout** — Remove shared `Navbar` dependency. The admin panel owns its sidebar, top bar, and user dropdown.

2. **Grouped navigation** — Use `navGroups` array at module scope for static navigation data. This eliminates per-render allocation and provides a single source of truth.

3. **Derived page titles** — Use `getPageTitle()` function that derives titles from `navGroups` instead of hardcoding pathname-to-title mappings. This keeps navigation data in one place.

4. **Memoized sidebar** — Extract `SidebarContent` as a `React.memo` component to prevent unnecessary re-renders when only dropdown/mobile menu state changes.

5. **SPA routing** — Use `<Link to="/">` instead of `<a href="/">` for client-side navigation.

### Implementation Pattern

```tsx
// Module-scope static data (no per-render allocation)
const navGroups = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    ],
  },
  // ...
];

// Derived title from navGroups (single source of truth)
function getPageTitle(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.end ? pathname === item.to : pathname.startsWith(item.to)) {
        return item.label;
      }
    }
  }
  return 'Admin Portal';
}

// Memoized sidebar component
const SidebarContent = React.memo(function SidebarContent({
  user,
  adminInitials,
  onCloseMobile,
}: {
  user: AuthUser | null;
  adminInitials: string;
  onCloseMobile?: () => void;
}) {
  // ... sidebar JSX
});
```

## Why This Works

- **Consistency** — Both admin and vendor portals now follow the same self-contained pattern
- **Maintainability** — Navigation data lives in one place (`navGroups`)
- **Performance** — Memoized sidebar prevents unnecessary re-renders
- **SPA compatibility** — Proper React Router `<Link>` for client-side navigation

## Verification

- TypeScript: `npx tsc --noEmit` passes with zero errors
- All admin routes render correctly: `/admin`, `/admin/vendors`, `/admin/products`, `/admin/payouts`, `/admin/settings`
- Mobile responsive: hamburger menu opens/closes sidebar overlay
- Logout flow works: calls `useLogoutMutation`, redirects to `/`

## Learnings

1. **Follow existing patterns** — The `VendorLayout` was the reference implementation. Copy its structure, don't reinvent.
2. **Module-scope for static data** — Static arrays like `navGroups` should be outside components to avoid per-render allocation.
3. **Derive, don't duplicate** — Use functions like `getPageTitle()` to derive values from source data instead of maintaining parallel mappings.
4. **Memoize expensive subtrees** — `React.memo` on sidebar components prevents unnecessary re-renders.
5. **SPA routing matters** — Always use `<Link>` for client-side navigation, never `<a href>`.

## Related

- `VendorLayout` — Reference implementation for self-contained dashboard layouts
- `AdminPortalLayout` — This solution's target file
- `CONCEPTS.md` — Project vocabulary and architecture decisions
