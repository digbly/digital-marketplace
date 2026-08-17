---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-17
---

# Storefront & Buyer Area Live API Integration Plan

## 1. Executive Summary & Goal Capsule
**Mục tiêu**: Chuyển đổi toàn bộ 5 màn hình thuộc nhánh Storefront & Buyer (`HomeView`, `BrowseProductsView`, `ProductDetailView`, `CartCheckoutView`, `BuyerLibraryView`) và `Navbar` từ việc sử dụng mock data tĩnh trong Zustand sang tích hợp 100% với hệ thống API Backend Laravel 12 (`/api/v1/storefront/*` và `/api/v1/buyer/*`).

**Kiến trúc cốt lõi đã thống nhất**:
- **Server Data Fetching**: Sử dụng Redux Toolkit Query (RTK Query) qua `storefrontApi.ts` và `buyerApi.ts` kết nối với API backend Laravel (`/api/v1/...`). Hỗ trợ cache tags invalidation, loading skeleton states, empty states, error handling.
- **Client & Cart State**: Giữ Cart trong Zustand Store (`web/src/store/marketplaceStore.ts`) đồng bộ với `localStorage` để thao tác thêm/xóa/sửa giỏ hàng phản hồi tức thì mà không phụ thuộc mạng.
- **Checkout & Auth Handling**: Khách vãng lai (Guest) có thể thêm giỏ hàng tự do; tại trang Checkout (`CartCheckoutView`), nếu chưa đăng nhập sẽ hiển thị CTA hoặc chuyển hướng đăng nhập với `?redirect=/checkout`. Khi đã đăng nhập, gọi mutation `useCheckoutMutation` gửi đơn hàng lên server.
- **Digital Asset Delivery & Reviews**: Tích hợp `BuyerLibraryView` để fetch danh sách tài sản số đã mua (`/api/v1/buyer/library`), tải file an toàn (`/api/v1/buyer/download/{token}`), và gửi review/rating (`/api/v1/buyer/reviews`).

---

## 2. User Roles & Scope Boundaries

### User Roles & Actors
- **Guest / Unauthenticated Buyer**: Có thể duyệt trang chủ, tìm kiếm danh mục, xem chi tiết sản phẩm, và thêm vào giỏ hàng. Khi thanh toán sẽ được yêu cầu đăng nhập.
- **Authenticated Buyer**: Có thể thanh toán đơn hàng (Stripe, PayPal, MoMo, Chuyển khoản), xem thư viện tài sản đã mua, tải file bằng secure token, copy license key, và viết review đánh giá sản phẩm.

### In Scope (Files to Modify/Create)
1. `web/src/store/services/apiSlice.ts`: Thêm tagTypes `StorefrontProducts`, `BuyerLibrary`, `Categories`.
2. `web/src/store/services/storefrontApi.ts`: Cung cấp các endpoints `getCategories`, `getStorefrontProducts`, `getProductBySlug`, `checkout`.
3. `web/src/store/services/buyerApi.ts`: [NEW] Cung cấp các endpoints `getBuyerLibrary`, `createReview`.
4. `web/src/views/storefront/HomeView.tsx`: Thay thế mock data bằng live API `useGetCategoriesQuery` và `useGetStorefrontProductsQuery({ is_featured: true })`.
5. `web/src/views/storefront/BrowseProductsView.tsx`: Tích hợp bộ lọc real-time với backend (search, category_id, product_type, sort_by, rating).
6. `web/src/views/storefront/ProductDetailView.tsx`: Fetch chi tiết sản phẩm theo slug bằng `useGetProductBySlugQuery(slug)`, hiển thị vendor, reviews thật, và chức năng Add to Cart / Buy Now.
7. `web/src/views/storefront/CartCheckoutView.tsx`: Tích hợp kiểm tra auth state (`isAuthenticated`), gọi `useCheckoutMutation` khi đặt hàng, chuyển hướng sau khi thành công.
8. `web/src/views/buyer/BuyerLibraryView.tsx`: Tích hợp `useGetBuyerLibraryQuery`, trigger download token, và mutation `useCreateReviewMutation`.
9. `web/src/components/layout/Navbar.tsx`: Fetch live categories cho dropdown menu thay vì mock data.

### Out of Scope
- Chỉnh sửa hệ thống Vendor Portal hoặc Admin Portal (đã hoàn thiện ở các kế hoạch riêng).
- Tích hợp cổng thanh toán mới ngoài hệ thống đã có trong module `Modules\Payment`.

---

## 3. API Contract & Integration Specification

### Storefront Endpoints (`/api/v1/storefront/...`)
- **GET `/api/v1/storefront/categories`**: Trả về cây danh mục sản phẩm đang active.
  - Tag: `providesTags: ['Categories']`
- **GET `/api/v1/storefront/products`**: Danh sách sản phẩm kèm phân trang và bộ lọc:
  - Query params: `search`, `category_id`, `product_type`, `is_featured`, `sort_by` (`newest`, `popular`, `price_asc`, `price_desc`, `rating`), `page`, `per_page`.
  - Tag: `providesTags: ['StorefrontProducts']`
- **GET `/api/v1/storefront/products/{slug}`**: Chi tiết 1 sản phẩm kèm vendor, reviews, rating.
  - Tag: `providesTags: (_res, _err, slug) => [{ type: 'StorefrontProducts', id: slug }]`
- **POST `/api/v1/storefront/checkout`**: Khởi tạo order và payment (Yêu cầu `auth:api` token).
  - Body: `{ items: [{ product_id: string, quantity: number }], payment_method: 'stripe' | 'paypal' | 'momo' | 'bank_transfer' }`
  - Invalidate: `['BuyerLibrary', 'StorefrontProducts']`

### Buyer Endpoints (`/api/v1/buyer/...`)
- **GET `/api/v1/buyer/library`**: Lấy danh sách item đã mua của buyer (Yêu cầu `auth:api` token).
  - Tag: `providesTags: ['BuyerLibrary']`
- **GET `/api/v1/buyer/download/{token}`**: Tải file bảo mật qua token streaming.
- **POST `/api/v1/buyer/reviews`**: Gửi rating & comment (Yêu cầu `auth:api` token).
  - Body: `{ product_id: string, order_item_id: string, rating: number, comment: string }`
  - Invalidate: `['StorefrontProducts', 'BuyerLibrary']`

---

## 4. Detailed Implementation Units

### Unit 1: RTK Query Services & Tag Types Configuration
- **Target Files**:
  - `web/src/store/services/apiSlice.ts`
  - `web/src/store/services/storefrontApi.ts`
  - `web/src/store/services/buyerApi.ts` [NEW]
  - `web/src/types/marketplace.ts`
- **Actions**:
  1. Cập nhật `apiSlice.ts` thêm `tagTypes: ['StorefrontProducts', 'BuyerLibrary']`.
  2. Bổ sung `checkout` mutation vào `storefrontApi.ts` với payload `{ items: Array<{ product_id: string; quantity: number }>; payment_method: string }`.
  3. Tạo `buyerApi.ts` định nghĩa:
     - `getBuyerLibrary`: `builder.query<ApiResponse<OrderItem[]>, void>` (`/buyer/library`)
     - `createReview`: `builder.mutation<ApiResponse<any>, { product_id: string; order_item_id: string; rating: number; comment: string }>` (`/buyer/reviews`)
  4. Đảm bảo types `Product`, `OrderItem`, `Category`, `Review` trong `types/marketplace.ts` tương thích 100% với response backend `ProductResource` và `OrderItemResource`.
- **Test Scenarios**:
  - `TS1.1`: Hook `useGetCategoriesQuery` compile không lỗi, gửi request đến `/api/v1/storefront/categories`.
  - `TS1.2`: Hook `useGetBuyerLibraryQuery` kèm token Bearer trong header khi đã đăng nhập.
  - `TS1.3`: Hook `useCheckoutMutation` gửi đúng payload items và payment_method.

---

### Unit 2: HomeView Real API Integration
- **Target File**: `web/src/views/storefront/HomeView.tsx`
- **Actions**:
  1. Thay thế `products` & `categories` từ Zustand mock store bằng `useGetStorefrontProductsQuery({ is_featured: true, per_page: 8 })` và `useGetCategoriesQuery()`.
  2. Thêm UI Skeleton loader và Empty State khi API đang tải hoặc chưa có sản phẩm.
  3. Giữ nút `addToCart` kết nối với Zustand Cart store để người dùng có thể mua nhanh.
  4. Hiển thị badge rating thật (`rating_avg`, `rating_count`) và giá (`price`, `sale_price`).
- **Test Scenarios**:
  - `TS2.1`: Render danh sách Featured Products thật từ backend.
  - `TS2.2`: Render Skeleton loader khi đang fetch API và chuyển sang dữ liệu thật khi hoàn tất.
  - `TS2.3`: Click nút Category điều hướng sang `/browse?category=...` và lọc đúng sản phẩm.

---

### Unit 3: BrowseProductsView Real API & Filtering Integration
- **Target File**: `web/src/views/storefront/BrowseProductsView.tsx`
- **Actions**:
  1. Chuyển đổi toàn bộ bộ lọc UI (Search, Category, Product Type, Sort By, Pagination) thành query params truyền trực tiếp vào `useGetStorefrontProductsQuery({ search, category_id, product_type, sort_by, page, per_page: 12 })`.
  2. Sử dụng `useGetCategoriesQuery` cho dropdown và sidebar danh mục.
  3. Thêm loading skeleton grid khi chuyển trang hoặc đổi filter.
  4. Thêm Empty State đẹp mắt khi không tìm thấy kết quả phù hợp ("No digital assets match your filter").
- **Test Scenarios**:
  - `TS3.1`: Gõ từ khóa tìm kiếm -> API `/storefront/products?search=...` được gọi với kết quả chính xác.
  - `TS3.2`: Chọn Sort "Price: Low to High" -> query `sort_by=price_asc` được truyền lên server.
  - `TS3.3`: Chọn Category -> lọc đúng `category_id`.
  - `TS3.4`: Chuyển trang (Pagination) -> hiển thị đúng trang `page` tiếp theo.

---

### Unit 4: ProductDetailView Real API, Reviews & Buy Now Flow
- **Target File**: `web/src/views/storefront/ProductDetailView.tsx`
- **Actions**:
  1. Lấy `slug` từ `useParams()` và gọi hook `useGetProductBySlugQuery(slug)`.
  2. Hiển thị thông tin sản phẩm: Title, Description, Changelog, Screenshots (`preview_images`), Vendor info (`vendor.store_name`, `vendor.user`), Files đính kèm (`files`), và Reviews (`reviews`).
  3. Xử lý trạng thái `isLoading` (Skeleton) và `isError` (Product not found 404).
  4. Xử lý nút "Add to Cart" và "Buy Now" (thêm vào giỏ và navigate sang `/checkout`).
- **Test Scenarios**:
  - `TS4.1`: Truy cập `/products/valid-slug` -> hiển thị đúng thông tin sản phẩm và reviews từ backend.
  - `TS4.2`: Truy cập `/products/non-existent-slug` -> hiển thị thông báo "Product Not Found" kèm nút quay lại Catalog.
  - `TS4.3`: Bấm "Buy Now" -> thêm sản phẩm vào giỏ hàng và chuyển hướng sang trang Checkout.

---

### Unit 5: CartCheckoutView Real API Mutation & Auth Integration
- **Target File**: `web/src/views/storefront/CartCheckoutView.tsx`
- **Actions**:
  1. Đọc auth state từ Redux store (`useAppSelector((state) => state.auth)`).
  2. Nếu người dùng chưa đăng nhập (`!isAuthenticated`):
     - Hiển thị Banner/Card yêu cầu đăng nhập: *"You need to sign in to complete this purchase and claim your digital license."*
     - Nút "Sign In to Checkout" chuyển hướng đến `/auth/login?redirect=/checkout`.
  3. Nếu người dùng đã đăng nhập:
     - Cho phép chọn phương thức thanh toán (`stripe`, `paypal`, `momo`, `bank_transfer`).
     - Khi bấm "Complete Purchase" -> gọi `checkoutMutation({ items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })), payment_method: selectedMethod })`.
     - Xử lý trạng thái loading `isSubmitting` với spinner.
     - Sau khi thành công: gọi `clearCart()` từ Zustand, hiển thị màn hình Order Confirmation và nút chuyển đến `/buyer/library`.
- **Test Scenarios**:
  - `TS5.1`: Guest user truy cập `/checkout` -> hiển thị prompt yêu cầu đăng nhập, chặn submit đơn hàng.
  - `TS5.2`: Authenticated user checkout giỏ hàng -> API `/api/v1/storefront/checkout` được gọi thành công, order được tạo.
  - `TS5.3`: Xóa sản phẩm khỏi giỏ hàng -> tổng tiền cập nhật chính xác.

---

### Unit 6: BuyerLibraryView Real API, Download Links & Review Modal
- **Target File**: `web/src/views/buyer/BuyerLibraryView.tsx`
- **Actions**:
  1. Sử dụng `useGetBuyerLibraryQuery()` để lấy danh sách `OrderItem` đã mua từ `/api/v1/buyer/library`.
  2. Hiển thị chi tiết từng item: Tên sản phẩm, thumbnail, license key (hỗ trợ nút Copy), danh sách file tải về.
  3. Xử lý nút "Download": Mở URL `/api/v1/buyer/download/${downloadToken}` để tải file trực tiếp từ server.
  4. Tích hợp Modal đánh giá: Khi người dùng chọn "Write Review", gọi `useCreateReviewMutation({ product_id, order_item_id, rating, comment })` và hiển thị toast/thông báo thành công.
- **Test Scenarios**:
  - `TS6.1`: Render danh sách sản phẩm đã mua cùng license keys tương ứng.
  - `TS6.2`: Click Copy License Key -> clipboard lưu đúng key và hiển thị tick icon xác nhận.
  - `TS6.3`: Gửi review thành công -> backend cập nhật rating và modal đóng lại.

---

### Unit 7: Storefront Layout & Navbar Dynamic Integration
- **Target File**: `web/src/components/layout/Navbar.tsx`
- **Actions**:
  1. Cập nhật dropdown Categories trong Navbar sử dụng `useGetCategoriesQuery()` thay vì mock data từ Zustand.
  2. Đảm bảo Badge số lượng sản phẩm trong giỏ hàng (`cart.length`) hiển thị chính xác theo Zustand store.
  3. Cập nhật Auth buttons (Sign In / Register khi là Guest, User Menu / Logout khi đã đăng nhập).
- **Test Scenarios**:
  - `TS7.1`: Dropdown category hiển thị đúng danh mục lấy từ backend.
  - `TS7.2`: Thêm sản phẩm vào giỏ -> Badge trên navbar tăng số lượng ngay lập tức.

---

## 5. Verification & Testing Plan

### Automated Build & Typecheck
- Chạy lệnh build TypeScript và Vite trong thư mục `web/`:
  ```bash
  npm --prefix web run build
  ```
- Kiểm tra linter:
  ```bash
  npm --prefix web run lint
  ```

### Manual Verification Checklist
1. **Trang chủ (`/`)**: Hiển thị Featured Products và Categories từ API.
2. **Catalog (`/browse`)**: Tìm kiếm theo từ khóa và đổi bộ lọc danh mục/sắp xếp giá hoạt động trơn tru.
3. **Chi tiết sản phẩm (`/products/:slug`)**: Dữ liệu tải đúng theo slug, rating trung bình và danh sách review hiển thị chính xác.
4. **Giỏ hàng & Checkout (`/checkout`)**:
   - Thêm sản phẩm khi là Guest -> vào Checkout thấy thông báo yêu cầu đăng nhập.
   - Đăng nhập xong quay lại Checkout -> chọn phương thức thanh toán và đặt hàng thành công.
5. **Thư viện người mua (`/buyer/library`)**:
   - Xem đơn hàng vừa mua, copy license key, tải file qua download token.
   - Gửi đánh giá và thấy rating cập nhật trên trang chi tiết sản phẩm.
