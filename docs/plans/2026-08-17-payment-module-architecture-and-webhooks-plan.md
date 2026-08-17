---
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
created: 2026-08-17
---

# Standalone Payment Module, Multi-Gateway Singleton Driver & Webhook Engine Plan

## 1. Executive Summary & Problem Frame
Tách hệ thống thanh toán thành một **Payment Module** độc lập với kiến trúc **Driver Pattern** (`PaymentManager` singleton), hỗ trợ đồng thời nhiều cổng thanh toán (**Mock/Platform Gateway**, **Stripe Checkout/PaymentIntent**, **PayPal Orders v2**), tích hợp **Webhook Engine tập trung** (`/api/webhooks/payment/{gateway}`) bảo mật với chữ ký điện tử (Signature Verification) & Idempotency, và liên kết với hệ thống giao hàng số / ví Vendor thông qua **Event-Driven Architecture**.

## 2. Scope Boundaries

### In Scope
- Tạo bảng `payments` và `payment_webhooks` độc lập.
- Xây dựng `PaymentManager` singleton kế thừa Laravel `Manager`.
- Xây dựng `PaymentGatewayInterface` cùng các DTOs chuẩn hóa (`PaymentInitResponse`, `WebhookResult`, `RefundResult`).
- Triển khai 3 Drivers: `MockGatewayDriver`, `StripeGatewayDriver`, `PayPalGatewayDriver`.
- Triển khai Webhook Controller tập trung với xác thực chữ ký và kiểm tra tính lũy kế (Idempotency).
- Kiến trúc Event-Driven: `PaymentCompleted`, `PaymentFailed`, `PaymentRefunded` và các Listeners xử lý bàn giao hàng số (`DigitalDeliveryService`), ghi nhận sổ cái ví Vendor (`VendorWallet`).
- Refactor `CheckoutController` và `CartCheckoutView.tsx` để hỗ trợ chọn và khởi tạo các cổng thanh toán.

### Out of Scope (Deferred)
- Cổng thanh toán nội địa (VNPay, MoMo) & Crypto On-chain gateway.
- Mô hình Recurring Billing / Subscription.

## 3. Architecture & Entities
- Models: `Payment`, `PaymentWebhook`.
- Enums: `PaymentStatus` (`pending`, `paid`, `failed`, `refunded`, `cancelled`).
- Interface: `App\Services\Payment\Contracts\PaymentGatewayInterface`.
- Manager: `App\Services\Payment\PaymentManager`.
- Drivers: `MockGatewayDriver`, `StripeGatewayDriver`, `PayPalGatewayDriver`.
- Events & Listeners:
  - `PaymentCompleted` -> `FulfillOrderOnPaymentCompleted`
  - `PaymentRefunded` -> `RevokeOrderOnPaymentRefunded`
  - `PaymentFailed` -> `HandleOrderPaymentFailed`
- Controllers: `PaymentWebhookController`, `CheckoutController`.

## 4. Implementation Units & Execution Sequence
- **Unit 1**: Database Migrations & Models (`payments`, `payment_webhooks`).
- **Unit 2**: Payment Core Interfaces, DTOs & `PaymentManager` Singleton.
- **Unit 3**: Payment Gateway Drivers (`Mock`, `Stripe`, `PayPal`).
- **Unit 4**: Events & Fulfillment Listeners (`PaymentCompleted`, `PaymentRefunded`, `PaymentFailed`).
- **Unit 5**: Webhook Engine Controller & API Routes (`POST /api/webhooks/payment/{gateway}`).
- **Unit 6**: Refactor Storefront Checkout Flow & Frontend Integration.
- **Unit 7**: Automated Unit & Feature Tests (Mock driver, Stripe signature test, Idempotency lock test).
