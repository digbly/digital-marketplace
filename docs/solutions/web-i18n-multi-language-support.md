# Solution: Web i18n Multi-Language Support

## Overview
Implemented complete internationalization (i18n) for the React frontend (`web/`) supporting 5 languages: Vietnamese (`vi`), English (`en`), Japanese (`ja`), Korean (`ko`), and Chinese (`zh`).

## Architecture & Configuration
1. **Libraries**: `i18next`, `react-i18next`, and `i18next-browser-languagedetector`.
2. **Configuration file**: `web/src/i18n.ts`
   - Configures language detection with `localStorage` persistence (key `i18nextLng`) and fallback to `vi`.
   - Imported at bootstrap in `web/src/main.tsx`.
3. **Locale dictionaries**:
   - `web/src/locales/vi.json`
   - `web/src/locales/en.json`
   - `web/src/locales/ja.json`
   - `web/src/locales/ko.json`
   - `web/src/locales/zh.json`
4. **UI Components & Layouts Fully Translated**:
   - `LanguageSwitcher.tsx`: Localized language selector headers and labels.
   - `StorefrontLayout.tsx`: Footer columns, trust badges, copyright, and creator links.
   - `Navbar.tsx`: Search, categories, perspective switcher, cart flyout, user profile menu.
   - `BrowseProductsView.tsx`: Filter sidebar, asset format badges, rating filters, sort dropdown, and pagination.
   - `ProductCard.tsx`: Price, actions, live preview, version/format badges.
   - `VendorLayout.tsx` & `AdminPortalLayout.tsx`: Full navigation menus, headers, wallet widgets, and breadcrumbs.
   - `AuthLayout.tsx`: Header, back link, tagline, and showcase features.

## Key Patterns
- When creating new UI components, use `useTranslation()` from `react-i18next` and reference translation keys defined under `web/src/locales/*.json`.
