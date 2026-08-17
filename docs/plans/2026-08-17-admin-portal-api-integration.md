---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-17
---

# Admin Portal Authentication & API Integration Plan

## 1. Executive Summary & Problem Frame
Phân hệ Super Admin Portal (`/admin/*`) trên ứng dụng web React hiện tại chưa được bảo vệ bằng lớp kiểm tra xác thực phân quyền (`ProtectedRoute allowedRoles={['admin']}`), và toàn bộ các màn hình Admin (`AdminDashboardView`, `AdminVendorsView`, `AdminProductsView`, `AdminPayoutsView`) đang đọc dữ liệu từ local mock store (`marketplaceStore.ts`) thay vì kết nối với hệ thống Backend API Laravel 12 đã sẵn sàng.

Kế hoạch này hoàn thiện 3 mục tiêu trọng tâm:
1. **Bảo vệ toàn diện định tuyến Admin**: Cập nhật `ProtectedRoute` hỗ trợ prop `allowedRoles?: string[]` và bọc toàn bộ nhánh route `/admin/*` bằng `<ProtectedRoute allowedRoles={['admin']}>`, ngăn chặn truy cập trái phép và tự động điều hướng sang trang login nếu chưa đăng nhập hoặc từ chối nếu không có quyền admin.
2. **Xây dựng tầng dịch vụ RTK Query cho Admin API**: Tạo `web/src/store/services/adminApi.ts` kết nối với hệ thống API backend (`/api/v1/admin/*`), hỗ trợ cache tag invalidation tức thời (`AdminAnalytics`, `AdminVendors`, `AdminProducts`, `AdminPayouts`) sau khi thực hiện các tác vụ phê duyệt / từ chối / kiểm duyệt.
3. **Chuyển đổi 100% các màn hình Admin sang Live API**:
   - `AdminDashboardView`: Tích hợp `GET /admin/analytics` hiển thị Gross Marketplace Volume (GMV), doanh thu hoa hồng sàn (commission revenue), số lượng vendor, buyer, tổng đơn hàng và danh sách đơn hàng gần nhất.
   - `AdminVendorsView`: Tích hợp `GET /admin/vendors` và `PUT /admin/vendors/{id}/status` để duyệt KYC, kích hoạt/tạm khóa gian hàng và điều chỉnh tỷ lệ hoa hồng riêng.
   - `AdminProductsView`: Tích hợp `GET /admin/products` và `PUT /admin/products/{id}/moderate` để duyệt sản phẩm, gắn cờ nổi bật (featured) hoặc từ chối sản phẩm vi phạm.
   - `AdminPayoutsView`: Tích hợp `GET /admin/payouts` và `PUT /admin/payouts/{id}/process` để xử lý thanh toán rút tiền cho Vendor (chuyển sang trạng thái completed/processed hoặc rejected kèm ghi chú).
   - `AdminSettingsView`: Hoàn thiện giao diện cấu hình thông số vận hành nền tảng.

---

## 2. User Roles & Actors
- **Super Admin**: Người dùng có `role === 'admin'`, có toàn quyền truy cập `/admin/*`, xem báo cáo thống kê sàn, duyệt gian hàng vendor, kiểm duyệt sản phẩm số và phê duyệt lệnh rút tiền.
- **Unauthorized Users (Buyer / Vendor / Guest)**: Người dùng chưa đăng nhập hoặc không có quyền `admin` sẽ bị chặn khi truy cập bất kỳ route nào thuộc `/admin` (điều hướng về `/auth/login` nếu chưa đăng nhập hoặc `/` nếu không đúng quyền).

---

## 3. Scope Boundaries

### In Scope
- **Route Guarding (`web/src/components/auth/ProtectedRoute.tsx` & `web/src/App.tsx`)**: Cập nhật `ProtectedRoute` hỗ trợ kiểm tra `allowedRoles` và bọc layout `/admin` trong `<ProtectedRoute allowedRoles={['admin']}>`.
- **API Tags Configuration (`web/src/store/services/apiSlice.ts`)**: Bổ sung các cache tag: `'AdminAnalytics'`, `'AdminVendors'`, `'AdminProducts'`, `'AdminPayouts'`.
- **Admin Types Definition (`web/src/types/admin.ts`)**: Khai báo cấu trúc dữ liệu cho Admin Analytics, Payloads duyệt Vendor, kiểm duyệt Product, xử lý Payout.
- **Admin RTK Query Service (`web/src/store/services/adminApi.ts`)**:
  - `useGetAdminAnalyticsQuery` (`GET /admin/analytics`)
  - `useGetAdminVendorsQuery` (`GET /admin/vendors`)
  - `useUpdateVendorStatusMutation` (`PUT /admin/vendors/{id}/status`)
  - `useGetAdminProductsQuery` (`GET /admin/products`)
  - `useModerateProductMutation` (`PUT /admin/products/{id}/moderate`)
  - `useGetAdminPayoutsQuery` (`GET /admin/payouts`)
  - `useProcessPayoutMutation` (`PUT /admin/payouts/{id}/process`)
- **Admin Views Live Data Migration**:
  - `web/src/views/admin/AdminDashboardView.tsx`
  - `web/src/views/admin/AdminVendorsView.tsx`
  - `web/src/views/admin/AdminProductsView.tsx`
  - `web/src/views/admin/AdminPayoutsView.tsx`
  - `web/src/views/admin/AdminSettingsView.tsx`

### Out of Scope
- Chỉnh sửa logic tính toán tài chính sâu trong core backend (backend Laravel controllers và services đã hoàn thiện chuẩn xác).
- Hệ thống phân quyền cấp dưới chi tiết (multi-admin role permissions matrix).

---

## 4. Architecture & Implementation Units

### Unit 1: Role-Based Route Protection & Admin Guards
- **Target Files**:
  - `web/src/components/auth/ProtectedRoute.tsx` [MODIFY]
  - `web/src/App.tsx` [MODIFY]
- **Action**:
  - Cập nhật `ProtectedRoute.tsx` thêm prop `allowedRoles?: string[]`. Khi `allowedRoles` được truyền vào, kiểm tra `user?.role`. Nếu role không khớp, điều hướng về `/`.
  - Trong `App.tsx`, bọc `<AdminPortalLayout />` bằng `<ProtectedRoute allowedRoles={['admin']}>`.
- **Test Scenarios**:
  - Chưa đăng nhập truy cập `/admin` -> Chuyển hướng về `/auth/login?redirect=/admin`.
  - Đăng nhập tài khoản `role: 'customer'` hoặc `role: 'vendor'` truy cập `/admin` -> Bị từ chối truy cập (redirect về `/`).
  - Đăng nhập tài khoản `role: 'admin'` truy cập `/admin` -> Render đầy đủ `AdminPortalLayout`.

---

### Unit 2: Admin TypeScript Types & RTK Query Service
- **Target Files**:
  - `web/src/types/admin.ts` [NEW]
  - `web/src/store/services/apiSlice.ts` [MODIFY]
  - `web/src/store/services/adminApi.ts` [NEW]
- **Action**:
  1. Tạo `web/src/types/admin.ts` khai báo:
     - `AdminAnalyticsData`: `{ total_revenue: number, total_commission: number, total_orders: number, total_products: number, total_vendors: number, total_buyers: number, recent_orders: Order[] }`.
     - `ApproveVendorPayload`: `{ id: string, status: 'approved' | 'suspended' | 'pending', commission_rate?: number }`.
     - `ModerateProductPayload`: `{ id: string, status: 'published' | 'rejected' | 'draft' | 'archived', is_featured?: boolean }`.
     - `ProcessPayoutPayload`: `{ id: string, status: 'processed' | 'rejected' | 'approved', admin_note?: string }`.
  2. Bổ sung `tagTypes: ['AdminAnalytics', 'AdminVendors', 'AdminProducts', 'AdminPayouts']` vào `web/src/store/services/apiSlice.ts`.
  3. Tạo `web/src/store/services/adminApi.ts` injectEndpoints vào `apiSlice`:
     - `getAdminAnalytics`: `GET /admin/analytics`, providesTags: `['AdminAnalytics']`.
     - `getAdminVendors`: `GET /admin/vendors`, providesTags: `['AdminVendors']`.
     - `updateVendorStatus`: `PUT /admin/vendors/{id}/status`, invalidatesTags: `['AdminVendors', 'AdminAnalytics']`.
     - `getAdminProducts`: `GET /admin/products`, providesTags: `['AdminProducts']`.
     - `moderateProduct`: `PUT /admin/products/{id}/moderate`, invalidatesTags: `['AdminProducts', 'AdminAnalytics']`.
     - `getAdminPayouts`: `GET /admin/payouts`, providesTags: `['AdminPayouts']`.
     - `processPayout`: `PUT /admin/payouts/{id}/process`, invalidatesTags: `['AdminPayouts', 'AdminAnalytics', 'VendorWallet']`.
- **Test Scenarios**:
  - `adminApi` export đầy đủ các query/mutation hooks.
  - Các mutation tự động invalidate đúng tags, kích hoạt re-fetch dữ liệu mới ngay lập tức.

---

### Unit 3: Live Data Migration - Admin Dashboard View
- **Target File**: `web/src/views/admin/AdminDashboardView.tsx`
- **Action**:
  - Thay thế dữ liệu tĩnh bằng hook `useGetAdminAnalyticsQuery()`.
  - Hiển thị GMV, Doanh thu hoa hồng sàn (Platform Commission Revenue), Tổng số lượng Vendors, Tổng số lượng Khách hàng (Buyers), Tổng số sản phẩm và đơn hàng.
  - Render bảng "Recent Platform Orders" dựa trên `analytics.recent_orders`.
  - Bổ sung trạng thái Loading Skeleton và Error Handling trang nhã.
- **Test Scenarios**:
  - Mở `/admin` -> Hiển thị các chỉ số tài chính và hoạt động thực tế từ database.
  - Khi có giao dịch mới, số liệu cập nhật chính xác.

---

### Unit 4: Live Data Migration - Admin Vendors View
- **Target File**: `web/src/views/admin/AdminVendorsView.tsx`
- **Action**:
  - Thay thế `useMarketplaceStore` bằng `useGetAdminVendorsQuery()` và `useUpdateVendorStatusMutation()`.
  - Hiển thị danh sách vendor kèm Store Name, Logo, Chủ sở hữu (Owner User Email), Tỷ lệ hoa hồng (%), Trạng thái KYC/Store (`approved`, `pending`, `suspended`).
  - Nút **Approve** gọi `updateVendorStatus({ id, status: 'approved' })`.
  - Nút **Suspend** gọi `updateVendorStatus({ id, status: 'suspended' })`.
  - Bổ sung modal hoặc inline input điều chỉnh `commission_rate` riêng cho vendor khi cần.
- **Test Scenarios**:
  - Mở `/admin/vendors` -> Hiển thị danh sách vendor từ backend.
  - Bấm "Approve" -> Gửi request `PUT /admin/vendors/{id}/status`, trạng thái badge chuyển sang xanh (`approved`) ngay lập tức mà không cần reload trang.
  - Bấm "Suspend" -> Trạng thái badge chuyển sang đỏ (`suspended`).

---

### Unit 5: Live Data Migration - Admin Products Moderation View
- **Target File**: `web/src/views/admin/AdminProductsView.tsx`
- **Action**:
  - Thay thế `useMarketplaceStore` bằng `useGetAdminProductsQuery()` và `useModerateProductMutation()`.
  - Hiển thị danh sách tất cả sản phẩm của toàn bộ vendor trên sàn: Thumbnail, Tên sản phẩm, Loại sản phẩm (File/License), Vendor sở hữu, Giá bán, Trạng thái (`published`, `draft`, `rejected`), Trạng thái nổi bật (`is_featured`).
  - Bấm nút **Featured / Standard** gọi `moderateProduct({ id, status: product.status, is_featured: !product.is_featured })`.
  - Bấm nút **Publish / Reject** gọi `moderateProduct({ id, status: 'published' | 'rejected' })`.
- **Test Scenarios**:
  - Mở `/admin/products` -> Hiển thị đầy đủ danh sách sản phẩm.
  - Bấm Publish -> Sản phẩm được duyệt và xuất hiện trên Storefront công khai.
  - Bấm Reject -> Sản phẩm bị ẩn khỏi Storefront.
  - Bấm toggle Featured -> Badge Featured đổi trạng thái tức thì.

---

### Unit 6: Live Data Migration - Admin Payouts & Settlement View
- **Target File**: `web/src/views/admin/AdminPayoutsView.tsx`
- **Action**:
  - Thay thế `useMarketplaceStore` bằng `useGetAdminPayoutsQuery()` và `useProcessPayoutMutation()`.
  - Hiển thị danh sách các yêu cầu rút tiền từ Vendor: Vendor Store, Số tiền yêu cầu, Phương thức thanh toán (Bank Transfer, PayPal, Crypto), Chi tiết tài khoản, Trạng thái (`pending`, `processed`, `rejected`).
  - Nút **Approve & Pay**: Mở popup xác nhận hoặc gọi `processPayout({ id, status: 'processed', admin_note: 'Transferred by Admin' })`.
  - Nút **Reject**: Gọi `processPayout({ id, status: 'rejected', admin_note: 'Declined by Admin' })`.
- **Test Scenarios**:
  - Mở `/admin/payouts` -> Hiển thị các payout request thực tế.
  - Bấm "Approve & Pay" -> Trạng thái chuyển sang `processed`, backend tự động trừ số dư ví và lưu log transaction.
  - Bấm "Reject" -> Trạng thái chuyển sang `rejected`, backend tự động hoàn lại tiền vào ví vendor.

---

### Unit 7: Polish Admin Settings View & Navigation
- **Target Files**:
  - `web/src/views/admin/AdminSettingsView.tsx`
  - `web/src/components/layout/AdminPortalLayout.tsx`
- **Action**:
  - Đảm bảo giao diện Settings phản hồi trực quan khi lưu cấu hình.
  - Đảm bảo `AdminPortalLayout` hiển thị thông tin Admin đăng nhập hiện tại và menu điều hướng hoạt động trơn tru.
- **Test Scenarios**:
  - Các tab điều hướng chuyển view mượt mà, giữ nguyên trạng thái auth.

---

## 5. Verification & Testing Strategy

### Automated Verification
```bash
# 1. Frontend Build & TypeScript Type Check
cd web && npm run build

# 2. Frontend Linting Check
cd web && npm run lint

# 3. Backend API Test Suite
cd api && php artisan test --filter=Admin
```

### Manual End-to-End Verification Flow
1. **Authentication Check**: Đăng nhập bằng tài khoản admin (`admin@example.com` / `password`).
2. **Dashboard Metrics**: Kiểm tra `/admin` hiển thị đúng GMV, tổng hoa hồng và các đơn hàng gần nhất.
3. **Vendor Approval Flow**: Mở `/admin/vendors`, đổi trạng thái một vendor sang `approved` và kiểm tra vendor đó đăng nhập có thể bán hàng bình thường.
4. **Product Moderation Flow**: Mở `/admin/products`, bấm duyệt một sản phẩm đang chờ và kiểm tra sản phẩm đó xuất hiện trên trang chủ Storefront.
5. **Payout Settlement Flow**: Mở `/admin/payouts`, duyệt một lệnh rút tiền và kiểm tra số dư ví của vendor tương ứng được cập nhật chính xác.
