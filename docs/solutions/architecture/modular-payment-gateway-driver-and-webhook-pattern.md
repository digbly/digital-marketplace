---
title: "Modular Payment Architecture with Multi-Gateway Drivers and Idempotent Webhook Engine"
date: "2026-08-17"
category: "architecture"
module: "payment"
problem_type: "architecture_pattern"
component: "payments"
severity: "medium"
applies_when:
  - "Designing a decoupled multi-gateway payment architecture in Laravel with webhook verification, idempotency tracking, and event-driven fulfillment"
tags:
  - "payment-gateway"
  - "driver-pattern"
  - "webhooks"
  - "idempotency"
  - "event-driven"
  - "laravel-modules"
---

# Modular Payment Architecture with Multi-Gateway Drivers and Idempotent Webhook Engine

## Context
E-commerce and multi-vendor marketplaces require processing payments through diverse payment providers (Stripe Checkout/Intents, PayPal Orders v2, Sandbox/Mock gateways) while ensuring:
1. **Gateway Agnosticism**: Core business logic (`OrderService`, `CheckoutController`) should not depend directly on third-party gateway SDKs.
2. **Idempotent Webhook Processing**: Preventing double-delivery, duplicate ledger crediting, or replay attacks when payment providers send duplicate webhook events.
3. **Event-Driven Decoupling**: Separating checkout initialization, gateway redirect, payment confirmation, and digital fulfillment (file access grants, license key assignment, and vendor ledger accounting) into distinct stages.

## Guidance

### 1. Modular Driver Architecture (`PaymentManager`)
Use Laravel's `Illuminate\Support\Manager` to implement a runtime-resolvable driver engine. Each gateway implements a unified `PaymentGatewayInterface`:

```php
// api/modules/payment/app/Contracts/PaymentGatewayInterface.php
interface PaymentGatewayInterface
{
    public function getName(): string;
    public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse;
    public function verifyWebhook(Request $request): WebhookResult;
    public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult;
}
```

The `PaymentManager` resolves drivers lazily from `api/config/payment.php` or `api/modules/payment/config/config.php` and supports runtime custom driver extensions via `extend()`:

```php
// api/modules/payment/app/Services/PaymentManager.php
class PaymentManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return $this->config->get('payment.default', 'mock');
    }

    protected function createMockDriver(): PaymentGatewayInterface { ... }
    protected function createStripeDriver(): PaymentGatewayInterface { ... }
    protected function createPaypalDriver(): PaymentGatewayInterface { ... }
}
```

### 2. Universal Webhook Engine with Idempotency Controls
Expose a single standardized webhook entry point: `POST /api/v1/webhooks/payment/{gateway}`. The engine enforces:
1. **Signature Verification**: Verifying cryptographic signatures (e.g. `Stripe-Signature` via HMAC-SHA256) inside the driver before processing payloads.
2. **Strict DB Idempotency**: Recording every webhook event in `payment_webhooks` with a unique constraint on `(gateway, event_id)`. If an event with status `processed` is received again, return HTTP 200 with `status: already_processed` immediately.

```php
// api/modules/payment/app/Http/Controllers/PaymentWebhookController.php
$webhookRecord = PaymentWebhook::where('gateway', $gateway)
    ->where('event_id', $webhookResult->eventId)
    ->first();

if ($webhookRecord && $webhookRecord->status === 'processed') {
    return response()->json([
        'status' => 'already_processed',
        'event_id' => $webhookResult->eventId,
    ], 200);
}
```

### 3. Event-Driven Fulfillment & Ledger Decoupling
When a payment succeeds or is refunded, dispatch domain events (`PaymentCompleted`, `PaymentRefunded`, `PaymentFailed`) rather than performing order fulfillment directly within webhook controllers or checkout services:
- **`PaymentCompleted`** $\rightarrow$ [FulfillOrderOnPaymentCompleted](file:///Users/dev/projects/test2/api/modules/payment/app/Listeners/FulfillOrderOnPaymentCompleted.php): Sets order to `paid`, grants secure file downloads via `DigitalDeliveryService`, assigns license keys, and credits the `vendor_wallets` balance with a `wallet_transactions` ledger entry.
- **`PaymentRefunded`** $\rightarrow$ [RevokeOrderOnPaymentRefunded](file:///Users/dev/projects/test2/api/modules/payment/app/Listeners/RevokeOrderOnPaymentRefunded.php): Expires `OrderDownload` tokens, revokes license keys, and deducts the vendor's wallet balance.

### 4. Modular Isolation via `nwidart/laravel-modules`
Place payment logic in `api/modules/payment`:
- Providers (`PaymentServiceProvider`, `RouteServiceProvider`, `EventServiceProvider`) isolate route mounting and event discovery.
- In `EventServiceProvider`, explicitly register the `$listen` array to avoid missing events or listener duplication between core application and module boundaries.

## Why This Matters
- **Extensibility**: Adding a new gateway (e.g. Adyen, Razorpay, VNPay) only requires adding a new driver implementing `PaymentGatewayInterface` without modifying checkout or fulfillment code.
- **Financial Safety**: Idempotency and database transaction wrapping prevent double-fulfillment and corrupted ledger balances under concurrent or retry webhooks.
- **Maintainability**: Clear boundary separation between order creation, payment gateways, and asset delivery.

## When to Apply
- When building multi-gateway e-commerce systems, subscription billing, or digital marketplaces requiring webhook handling and financial ledger integration.

## Key References & Files
- Gateway Contract: [`api/modules/payment/app/Contracts/PaymentGatewayInterface.php`](file:///Users/dev/projects/test2/api/modules/payment/app/Contracts/PaymentGatewayInterface.php)
- Payment Manager: [`api/modules/payment/app/Services/PaymentManager.php`](file:///Users/dev/projects/test2/api/modules/payment/app/Services/PaymentManager.php)
- Universal Webhook Controller: [`api/modules/payment/app/Http/Controllers/PaymentWebhookController.php`](file:///Users/dev/projects/test2/api/modules/payment/app/Http/Controllers/PaymentWebhookController.php)
- Webhook & Payment Unit Tests: [`api/tests/Feature/Payment/PaymentWebhookTest.php`](file:///Users/dev/projects/test2/api/tests/Feature/Payment/PaymentWebhookTest.php)
- Plan: [`docs/plans/2026-08-17-payment-module-architecture-and-webhooks-plan.md`](file:///Users/dev/projects/test2/docs/plans/2026-08-17-payment-module-architecture-and-webhooks-plan.md)
