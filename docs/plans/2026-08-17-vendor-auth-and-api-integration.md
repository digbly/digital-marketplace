---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-17
---

# Vendor Portal Authentication & API Integration Plan

## 1. Executive Summary & Problem Frame
Khu vực Vendor Portal (`/vendor/*`) trên ứng dụng web React hiện tại chưa được bảo vệ bằng lớp kiểm tra xác thực (`ProtectedRoute`), và toàn bộ 6 màn hình Vendor đang phụ thuộc vào mock store (`marketplaceStore.ts`). Đồng thời, các màn hình Auth (`LoginView`, `RegisterView`, `ForgotPasswordView`, `ResetPasswordView`, `VerifyEmailView`) đã được lập trình sẵn nhưng chưa được khai báo trên Router chính (`web/src/App.tsx`).

Kế hoạch này triển khai trọn vẹn 3 mục tiêu:
1. **Bảo vệ toàn diện định tuyến Auth & Vendor**: Mount đầy đủ các route Auth công khai và bọc toàn bộ `/vendor/*` bằng `<ProtectedRoute>`, tự động bắt đăng nhập và hỗ trợ redirect trở lại trang trước đó.
2. **Xây dựng tầng dịch vụ RTK Query cho Vendor API**: Tạo `web/src/store/services/vendorApi.ts` kết nối với hệ thống API backend Laravel 12 (`/api/v1/vendor/*`) có đầy đủ cache tags invalidation.
3. **Chuyển đổi 100% các màn hình Vendor sang Live API**: Thay thế mock store trong Layout, Dashboard, Products Catalog, Product Editor, Orders & Sales, Wallet & Payout, và Store Profile Settings bằng các hook RTK Query thực tế.

---

## 2. User Roles & Actors
- **Vendor (Seller / Creator)**: Người dùng đã đăng nhập sở hữu gian hàng trên hệ thống, quản lý sản phẩm, files, license keys, xem đơn hàng, số dư ví và rút tiền.
- **Guest / Unauthenticated Buyer**: Khách chưa đăng nhập khi truy cập bất kỳ route nào thuộc `/vendor` sẽ tự động được điều hướng đến `/auth/login`.

---

## 3. Scope Boundaries

### In Scope
- **Route Configuration (`web/src/App.tsx`)**: Mount `/auth/*` và bọc `/vendor` với `ProtectedRoute`.
- **Backend Stability Fix (`api/app/Http/Controllers/Vendor/VendorWalletController.php`)**: Đảm bảo `VendorWalletController::index()` tự động khởi tạo Vendor record bằng `firstOrCreate` tương tự `VendorProfileController` và `VendorProductController` để tránh lỗi 404 cho Vendor mới.
- **Redux API Slice Tags (`web/src/store/services/apiSlice.ts`)**: Bổ sung `tagTypes: ['VendorProfile', 'VendorProducts', 'VendorOrders', 'VendorWallet']`.
- **Vendor RTK Query Service (`web/src/store/services/vendorApi.ts`)**: Xây dựng toàn bộ các endpoint hooks:
  - `useGetVendorProfileQuery`, `useUpdateVendorProfileMutation`
  - `useGetVendorProductsQuery`, `useCreateVendorProductMutation`, `useUpdateVendorProductMutation`, `useDeleteVendorProductMutation`
  - `useUploadProductFileMutation`, `useImportProductLicenseKeysMutation`
  - `useGetVendorOrdersQuery`
  - `useGetVendorWalletQuery`, `useRequestPayoutMutation`
- **Storefront Categories API (`web/src/store/services/storefrontApi.ts`)**: Cung cấp `useGetCategoriesQuery` cho dropdown danh mục sản phẩm.
- **Vendor UI Components Migration**:
  - `web/src/components/layout/VendorLayout.tsx`
  - `web/src/views/vendor/VendorDashboardView.tsx`
  - `web/src/views/vendor/VendorProductsView.tsx`
  - `web/src/views/vendor/VendorProductEditView.tsx`
  - `web/src/views/vendor/VendorOrdersView.tsx`
  - `web/src/views/vendor/VendorWalletView.tsx`
  - `web/src/views/vendor/VendorSettingsView.tsx`

### Out of Scope
- Tích hợp cổng thanh toán trực tiếp Stripe Connect webhook (đã có module payment riêng).
- Tính năng Live Chat giữa Vendor và Buyer.
- Quản lý phân quyền nhân viên phụ (Sub-vendors / multi-user roles).

---

## 4. Architecture & Implementation Units

### Unit 1: Backend Vendor Wallet Robustness
- **Target File**: `api/app/Http/Controllers/Vendor/VendorWalletController.php`
- **Action**: Cập nhật hàm `index()` dùng `Vendor::firstOrCreate(['user_id' => Auth::id()], ...)` đồng nhất với `VendorProfileController` để vendor mới mở trang ví lần đầu không bị lỗi 404.
- **Test Scenarios**:
  - Gửi request `GET /api/vendor/wallet` với token user mới chưa có store -> trả về 200 OK kèm wallet ban đầu (balance = 0).

### Unit 2: Redux API Tag Types & Storefront Categories API
- **Target Files**:
  - `web/src/store/services/apiSlice.ts`
  - `web/src/store/services/storefrontApi.ts`
- **Action**:
  - Khai báo các tag types mới: `['VendorProfile', 'VendorProducts', 'VendorOrders', 'VendorWallet', 'Categories']`.
  - Tạo `storefrontApi.ts` với endpoint `getCategories: builder.query<ApiResponse<Category[]>, void>`.
- **Test Scenarios**:
  - Gọi hook `useGetCategoriesQuery()` trả về danh sách category có id, name, slug.

### Unit 3: Vendor RTK Query Service Layer
- **Target File**: `web/src/store/services/vendorApi.ts`
- **Action**: Tạo trọn bộ endpoints giao tiếp với Backend API Laravel 12:
  - `getVendorProfile`, `updateVendorProfile` (tags: `VendorProfile`)
  - `getVendorProducts`, `createVendorProduct`, `updateVendorProduct`, `deleteVendorProduct` (tags: `VendorProducts`)
  - `uploadProductFile` (multipart/form-data), `importProductLicenseKeys` (tags: `VendorProducts`)
  - `getVendorOrders` (tags: `VendorOrders`)
  - `getVendorWallet`, `requestPayout` (tags: `VendorWallet`)
- **Test Scenarios**:
  - Kiểm tra mutation `uploadProductFile` gửi đúng `FormData` đính kèm file version và main flag.
  - Mutation `createVendorProduct` và `deleteVendorProduct` tự động invalidate tag `VendorProducts`.
  - Mutation `requestPayout` tự động invalidate tag `VendorWallet`.

### Unit 4: Router Setup & Auth Guard
- **Target File**: `web/src/App.tsx`
- **Action**:
  - Import `LoginView`, `RegisterView`, `ForgotPasswordView`, `ResetPasswordView`, `VerifyEmailView`.
  - Mount các route auth vào `/auth/*` bọc trong `<PublicRoute>`.
  - Bọc cụm route `/vendor` vào `<ProtectedRoute>`.
- **Test Scenarios**:
  - Truy cập `/vendor` khi chưa đăng nhập -> redirect sang `/auth/login`.
  - Đăng nhập thành công -> tự động quay lại `/vendor`.

### Unit 5: Vendor Layout & Dashboard Live API
- **Target Files**:
  - `web/src/components/layout/VendorLayout.tsx`
  - `web/src/views/vendor/VendorDashboardView.tsx`
- **Action**:
  - `VendorLayout`: dùng `useGetVendorProfileQuery()` và `useGetVendorWalletQuery()`. Render tên store thực tế, logo/avatar và số dư khả dụng/escrow.
  - `VendorDashboardView`: dùng `useGetVendorWalletQuery()`, `useGetVendorProductsQuery()`, `useGetVendorOrdersQuery()`. Tính toán metrics thực tế (tổng sản phẩm, tổng doanh thu, số dư ví, bảng sản phẩm mới nhất).
- **Test Scenarios**:
  - Hiển thị skeleton loading trong khi đang tải dữ liệu.
  - Hiển thị đúng số liệu thống kê ví và danh sách sản phẩm thực từ API.

### Unit 6: Vendor Products Management (CRUD, Files & License Keys)
- **Target Files**:
  - `web/src/views/vendor/VendorProductsView.tsx`
  - `web/src/views/vendor/VendorProductEditView.tsx`
- **Action**:
  - `VendorProductsView`: Dùng `useGetVendorProductsQuery()`, `useDeleteVendorProductMutation()`, `useUploadProductFileMutation()`, `useImportProductLicenseKeysMutation()`. Xử lý upload file thực tế qua file input, import license keys qua textarea theo từng dòng, modal xác nhận xoá sản phẩm.
  - `VendorProductEditView`: Dùng `useGetCategoriesQuery()` cho category selector, `useCreateVendorProductMutation()` để submit tạo sản phẩm mới.
- **Test Scenarios**:
  - Tạo sản phẩm mới thành công -> chuyển về danh sách sản phẩm và xuất hiện sản phẩm vừa tạo.
  - Upload file đính kèm cho sản phẩm -> file hiển thị trong chi tiết sản phẩm.
  - Import 5 license keys -> danh sách key cập nhật thành công.
  - Xoá sản phẩm -> biến mất khỏi danh sách mà không cần reload trang.

### Unit 7: Vendor Orders, Wallet & Settings Migration
- **Target Files**:
  - `web/src/views/vendor/VendorOrdersView.tsx`
  - `web/src/views/vendor/VendorWalletView.tsx`
  - `web/src/views/vendor/VendorSettingsView.tsx`
- **Action**:
  - `VendorOrdersView`: Dùng `useGetVendorOrdersQuery()`. Render bảng danh sách đơn hàng thực, khách mua, giá tiền và trạng thái giao hàng số.
  - `VendorWalletView`: Dùng `useGetVendorWalletQuery()`, `useRequestPayoutMutation()`. Render số dư ví, danh sách biến động số dư (`transactions`), modal gửi yêu cầu rút tiền với validation số dư.
  - `VendorSettingsView`: Dùng `useGetVendorProfileQuery()`, `useUpdateVendorProfileMutation()`. Điền dữ liệu store sẵn có vào form, cập nhật thông tin tên gian hàng, bio, logo_url, banner_url qua API.
- **Test Scenarios**:
  - Mở trang Settings hiển thị đúng tên store và bio hiện tại; bấm lưu thông báo cập nhật thành công.
  - Mở trang Wallet thấy lịch sử giao dịch; gửi yêu cầu rút tiền $50 -> số dư ví cập nhật chính xác.

---

## 5. Dependencies & Sequencing
- **Bước 1**: Unit 1 (Backend Wallet Controller fix).
- **Bước 2**: Unit 2 & Unit 3 (Redux API slices & hooks).
- **Bước 3**: Unit 4 (App.tsx router & auth protection).
- **Bước 4**: Unit 5 (Vendor Layout & Dashboard).
- **Bước 5**: Unit 6 (Products Catalog, File upload & License keys).
- **Bước 6**: Unit 7 (Orders, Wallet & Settings).
- **Bước 7**: Kiểm thử E2E toàn bộ luồng Auth -> Vendor Portal -> Products -> Orders -> Wallet -> Settings.

---

## 6. Risk Analysis & Mitigations
| Rủi ro tiềm ẩn | Mức độ | Biện pháp giảm thiểu |
| :--- | :--- | :--- |
| Token hết hạn khi vendor đang thao tác | Trung bình | `baseQueryWithReauth` trong `apiSlice.ts` đã có cơ chế tự động refresh token bằng mutex và redirect khi token không hợp lệ. |
| Upload file số kích thước lớn | Trung bình | Gửi `FormData` trực tiếp qua `uploadProductFile` mutation, kiểm tra validation backend. |
| Vendor mới chưa có dữ liệu store | Thấp | Backend dùng `firstOrCreate` đảm bảo luôn có Vendor profile mặc định, UI có empty states thân thiện. |

---

## 7. Verification & Testing Plan
- **Frontend Build & Type Check**:
  ```bash
  cd web && npm run build
  ```
- **Backend Tests & PHP Syntax Check**:
  ```bash
  cd api && php artisan test --filter=Vendor
  ```
- **Manual Flow Verification**:
  1. Mở trình duyệt, truy cập `/vendor` -> xác nhận redirect về `/auth/login`.
  2. Đăng nhập tài khoản -> tự động chuyển vào `/vendor` Overview.
  3. Tạo sản phẩm mới tại `/vendor/products/new`, upload file đính kèm và import license key.
  4. Cập nhật thông tin Store tại `/vendor/settings`.
  5. Kiểm tra trang Wallet và tạo yêu cầu rút tiền.
