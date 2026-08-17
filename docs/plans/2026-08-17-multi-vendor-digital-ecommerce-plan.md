---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-17
---

# Multi-Vendor Digital E-Commerce Platform Plan

## 1. Executive Summary & Problem Frame
Chuyển đổi toàn diện codebase hiện tại (Laravel 12 API + React Vite) từ CMS/Website Builder sang nền tảng **Sàn Thương Mại Điện Tử Sản Phẩm Số Đa Nhà Bán Hàng (Multi-Vendor Digital Marketplace)**. Nền tảng phục vụ 3 nhóm đối tượng:
- **Buyer (Khách hàng)**: Tìm kiếm, mua các sản phẩm số (Downloadable files, License Keys, Bundles), thanh toán trực tuyến và truy cập kho tải/bản quyền an toàn.
- **Vendor (Nhà bán hàng/Creator)**: Đăng ký gian hàng, đăng bán tài nguyên số, upload file bảo mật vào Private Storage, quản lý kho license keys, theo dõi doanh thu và tạo yêu cầu rút tiền.
- **Admin (Quản trị viên sàn)**: Kiểm duyệt sản phẩm & gian hàng, quản lý tỷ lệ hoa hồng sàn, duyệt và giải ngân lệnh rút tiền, giám sát đơn hàng và khiếu nại.

## 2. Scope Boundaries
### In Scope
- Clean slate refactor: Loại bỏ hoàn toàn Website Builder & DynamicModel cũ.
- Tái sử dụng & chuẩn hóa hạ tầng Core: Auth/Passport, User & RBAC, Media Library, Activity Log, Swagger.
- 3 phân hệ giao diện: Storefront, Vendor Dashboard, Super Admin Portal.
- Mô hình ví sàn & thanh toán tập trung (Platform Wallet & Escrow holding period).
- Phân phối tài nguyên số an toàn: Link tải có chữ ký điện tử (Signed temporary URLs) có hạn sử dụng và giới hạn lượt tải, cấp phát license keys tự động.
- Hệ thống đánh giá & xếp hạng sản phẩm (Product Reviews & Ratings).

### Out of Scope (Deferred)
- Subscription / recurring billing & LMS e-learning course player.
- Live Chat realtime giữa buyer và vendor.
- Tự động split payment qua Stripe Connect / PayPal Marketplace.

## 3. Architecture & Entities
- Enums: `UserRole`, `VendorStatus`, `ProductType`, `ProductStatus`, `PaymentStatus`, `LicenseKeyStatus`, `PayoutStatus`, `WalletTransactionType`.
- Models: `User`, `Vendor`, `Category`, `CategoryTranslation`, `Product`, `ProductTranslation`, `ProductFile`, `ProductLicenseKey`, `Order`, `OrderItem`, `OrderDownload`, `VendorWallet`, `WalletTransaction`, `PayoutRequest`, `Review`.
- Services: `DigitalDeliveryService`, `OrderService`, `PayoutService`.

## 4. Execution Sequence
- Unit 1: Backend Cleanup & Base Enums + Migrations.
- Unit 2: Backend Models, FormRequests, Resources & Swagger annotations.
- Unit 3: Backend Core Services (Delivery, Orders, Wallet & Payout).
- Unit 4: Backend API Controllers & Routes.
- Unit 5: Frontend Layouts, Router & Auth Context updates.
- Unit 6: Frontend Storefront (Home, Browse, Product Detail, Cart & Checkout, Buyer Library).
- Unit 7: Frontend Vendor Dashboard (Products CRUD, File Uploader, License Key Manager, Wallet & Payout).
- Unit 8: Frontend Admin Portal (Vendor Approvals, Product Moderation, Payout Approvals, Analytics).
- Unit 9: End-to-End Verification & Documentation.
