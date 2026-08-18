---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-18
---

# Vendor Admin Dashboard Layout Redesign Plan

## 1. Executive Summary & Problem Frame
Hiện tại, khu vực Vendor Portal (`/vendor/*` được khai báo trong `web/src/App.tsx`) sử dụng `web/src/components/layout/VendorLayout.tsx` theo cấu trúc nhúng chung với thanh `<Navbar />` bán lẻ của Storefront và hiển thị sidebar dạng card nổi trong `max-w-7xl`. Bố cục này thiếu tính chất của một trang quản trị chuyên nghiệp (SaaS Admin Portal), không tận dụng được tối đa diện tích làm việc và gây phân tâm bởi các thành phần tìm kiếm/giỏ hàng người mua.

Kế hoạch này tái thiết kế `VendorLayout.tsx` thành một giao diện quản trị độc lập, hiện đại, chuẩn SaaS:
1. **Full-height Dashboard Layout**: Sidebar cố định bên trái (Desktop) hoặc slide-over drawer (Mobile/Tablet) với thương hiệu riêng biệt.
2. **Topbar Quản Trị Độc Lập**: Có Breadcrumb ngữ cảnh động, nút hành động nhanh (+ Upload Asset, Xem Storefront) và Dropdown hồ sơ/đăng xuất người dùng.
3. **Menu Điều Hướng Chuẩn Quốc Tế (Bilingual / Standard)**: Nhóm menu logic (Overview, Products Catalog, Upload Asset, Orders, Wallet & Payouts, Store Settings) kết hợp widget xem nhanh số dư ví.

---

## 2. User Roles & Actors
- **Vendor / Seller**: Người bán số đã đăng nhập, quản lý sản phẩm, đơn hàng, doanh thu và cấu hình shop.
- **Guest**: Chưa đăng nhập khi vào `/vendor/*` đã được bọc bởi `ProtectedRoute` chuyển hướng về `/auth/login`.

---

## 3. Scope Boundaries

### In Scope
- **File tác động**: `web/src/components/layout/VendorLayout.tsx`
- **Kiến trúc Layout**:
  - Giao diện Admin Full-screen Dark Theme (`bg-slate-950`).
  - Sidebar cố định (`w-64`, `bg-slate-900 border-r border-slate-800`).
  - Top Navigation Header (`h-16`, `bg-slate-900/90 backdrop-blur-md border-b border-slate-800`).
  - Khung nội dung chính (`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto`).
  - Hỗ trợ đầy đủ tương tác Mobile Drawer khi màn hình nhỏ.
  - Tích hợp gọi RTK Query hooks `useGetVendorProfileQuery`, `useGetVendorWalletQuery` và `useLogoutMutation`.

### Out of Scope
- Không can thiệp các component view con trong `web/src/views/vendor/*`.
- Không thay đổi các route khai báo trong `web/src/App.tsx`.

---

## 4. Architecture & Implementation Units

### Unit 1: Redesign Vendor Admin Dashboard Shell
- **Target File**: `web/src/components/layout/VendorLayout.tsx`
- **Key Subcomponents & Structure**:
  1. **Sidebar Navigation**:
     - *Brand Header*: Biểu tượng Store, tiêu đề "Vendor Hub" và huy hiệu "PRO".
     - *Store Quick Profile*: Logo shop (hoặc chữ viết tắt initials), tên shop và trạng thái hoạt động.
     - *Categorized Navigation*:
       - `Overview`: `/vendor` (`LayoutDashboard`)
       - `Products Catalog`: `/vendor/products` (`Package`)
       - `Upload Asset`: `/vendor/products/new` (`PlusCircle`)
       - `Sales & Orders`: `/vendor/orders` (`ShoppingBag`)
       - `Earnings & Wallet`: `/vendor/wallet` (`Wallet`)
       - `Store Profile`: `/vendor/settings` (`Settings`)
     - *Quick Wallet Balance*: Hiển thị số dư khả dụng (`balance`), số tiền đang giữ (`holding_balance`) và link rút tiền nhanh.
     - *Sidebar Footer*: Nút chuyển sang "View Storefront" (`/`) và nút "Đăng xuất" (gọi `handleLogout`).
  2. **Top Management Header Bar**:
     - Hamburger icon button toggle cho mobile drawer.
     - Dynamic Breadcrumb (Vendor Portal > Current Section).
     - Action CTAs: "+ Đăng Sản Phẩm", "Xem Marketplace".
     - Profile Avatar Dropdown Menu (Thông tin tài khoản, link cài đặt, ví, đăng xuất).
  3. **Mobile Drawer Overlay**:
     - Slide-over drawer với nền tối mờ khi người dùng mở menu trên mobile.
  4. **Main Content Container**:
     - Render `<Outlet />` trong container đệm chuẩn `p-4 sm:p-6 lg:p-8`.

---

## 5. Verification Plan & Test Scenarios

### Automated Build Verification
- Chạy `npm run build` trong thư mục `web/` để kiểm tra TypeScript types và Vite bundle.

### Manual Verification
1. Truy cập `/vendor` -> Kiểm tra giao diện Full-screen, Sidebar bên trái cố định, Topbar trên cùng có breadcrumb "Bảng Điều Khiển / Overview".
2. Nhấp qua các mục menu (`/vendor/products`, `/vendor/products/new`, `/vendor/orders`, `/vendor/wallet`, `/vendor/settings`) -> Kiểm tra active style trên sidebar và breadcrumb cập nhật tương ứng.
3. Kiểm tra hiển thị số dư ví trong Sidebar widget.
4. Mở Dropdown Profile góc phải trên Header -> Kiểm tra các đường dẫn và nút Đăng xuất.
5. Thử nghiệm trên kích thước màn hình Mobile -> Mở Hamburger Menu, kiểm tra drawer trượt ra và tự đóng khi chọn mục.
