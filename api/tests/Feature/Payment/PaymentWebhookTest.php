<?php

namespace Tests\Feature\Payment;

use App\Enums\LicenseKeyStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderDownload;
use App\Models\Product;
use App\Models\ProductLicenseKey;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorWallet;
use Database\Seeders\DigitalMarketplaceSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Modules\Payment\Models\Payment;
use Tests\TestCase;

class PaymentWebhookTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);
    }

    public function test_mock_webhook_fulfills_order_and_credits_vendor(): void
    {
        $buyer = User::where('role', 'buyer')->first() ?? User::factory()->create();
        $product = Product::with('vendor')->first();
        $vendor = $product->vendor;

        $wallet = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor->id],
            ['balance' => 100.00, 'holding_balance' => 0, 'total_earned' => 100.00, 'total_withdrawn' => 0]
        );
        $initialBalance = $wallet->balance;

        $order = Order::create([
            'order_number' => 'ORD-TEST-001',
            'buyer_id' => $buyer->id,
            'subtotal_amount' => $product->effective_price,
            'total_amount' => $product->effective_price,
            'payment_method' => 'mock',
            'payment_status' => PaymentStatus::PENDING,
            'customer_email' => $buyer->email,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'product_name' => $product->name,
            'product_type' => $product->product_type->value,
            'price' => $product->effective_price,
            'commission_rate' => 15.00,
            'commission_amount' => round(($product->effective_price * 15) / 100, 2),
            'vendor_earning' => round($product->effective_price - (($product->effective_price * 15) / 100), 2),
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $buyer->id,
            'payment_method' => 'mock',
            'amount' => $product->effective_price,
            'currency' => 'USD',
            'status' => PaymentStatus::PENDING,
            'gateway_reference' => 'MOCK-REF-TEST01',
        ]);

        // Send Webhook to /api/v1/webhooks/payment/mock
        $response = $this->postJson('/api/v1/webhooks/payment/mock', [
            'event_id' => 'evt_mock_001',
            'event_type' => 'payment.success',
            'payment_id' => $payment->id,
            'transaction_id' => 'TXN-MOCK-SUCCESS',
            'reference' => 'MOCK-REF-TEST01',
            'amount' => $product->effective_price,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'payment_status' => 'paid',
        ]);

        // Verify Order is marked paid
        $order->refresh();
        $this->assertEquals(PaymentStatus::PAID, $order->payment_status);

        // Verify Payment is marked paid
        $payment->refresh();
        $this->assertEquals(PaymentStatus::PAID, $payment->status);
        $this->assertEquals('TXN-MOCK-SUCCESS', $payment->gateway_transaction_id);

        // Verify Vendor Wallet is credited
        $wallet->refresh();
        $this->assertEquals($initialBalance + $orderItem->vendor_earning, $wallet->balance);

        // Verify Downloads were fulfilled
        $downloads = OrderDownload::where('order_item_id', $orderItem->id)->get();
        $this->assertNotEmpty($downloads);
    }

    public function test_webhook_idempotency_prevents_duplicate_processing(): void
    {
        $buyer = User::where('role', 'buyer')->first() ?? User::factory()->create();
        $product = Product::with('vendor')->first();
        $vendor = $product->vendor;

        $wallet = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor->id],
            ['balance' => 0.00, 'holding_balance' => 0, 'total_earned' => 0.00, 'total_withdrawn' => 0]
        );
        $initialBalance = (float) $wallet->balance;

        $order = Order::create([
            'order_number' => 'ORD-TEST-002',
            'buyer_id' => $buyer->id,
            'subtotal_amount' => 50.00,
            'total_amount' => 50.00,
            'payment_method' => 'mock',
            'payment_status' => PaymentStatus::PENDING,
            'customer_email' => $buyer->email,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'product_name' => $product->name,
            'product_type' => $product->product_type->value,
            'price' => 50.00,
            'commission_rate' => 10.00,
            'commission_amount' => 5.00,
            'vendor_earning' => 45.00,
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $buyer->id,
            'payment_method' => 'mock',
            'amount' => 50.00,
            'currency' => 'USD',
            'status' => PaymentStatus::PENDING,
        ]);

        $webhookPayload = [
            'event_id' => 'evt_idempotent_123',
            'event_type' => 'payment.success',
            'payment_id' => $payment->id,
            'transaction_id' => 'TXN-MOCK-123',
            'amount' => 50.00,
        ];

        // 1st request -> success
        $res1 = $this->postJson('/api/v1/webhooks/payment/mock', $webhookPayload);
        $res1->assertStatus(200);
        $res1->assertJson(['status' => 'success']);

        $wallet->refresh();
        $this->assertEquals($initialBalance + 45.00, (float) $wallet->balance);

        // 2nd request with EXACT same event_id -> already_processed
        $res2 = $this->postJson('/api/v1/webhooks/payment/mock', $webhookPayload);
        $res2->assertStatus(200);
        $res2->assertJson([
            'status' => 'already_processed',
            'event_id' => 'evt_idempotent_123',
        ]);

        // Balance should NOT increase again (remains initialBalance + 45.00)
        $wallet->refresh();
        $this->assertEquals($initialBalance + 45.00, (float) $wallet->balance);
    }

    public function test_mock_webhook_refund_revokes_tokens_and_deducts_balance(): void
    {
        $buyer = User::where('role', 'buyer')->first() ?? User::factory()->create();
        $product = Product::with('vendor')->first();
        $vendor = $product->vendor;

        $wallet = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor->id],
            ['balance' => 100.00, 'holding_balance' => 0, 'total_earned' => 100.00, 'total_withdrawn' => 0]
        );
        $initialBalance = (float) $wallet->balance;

        $order = Order::create([
            'order_number' => 'ORD-TEST-003',
            'buyer_id' => $buyer->id,
            'subtotal_amount' => 100.00,
            'total_amount' => 100.00,
            'payment_method' => 'mock',
            'payment_status' => PaymentStatus::PAID,
            'customer_email' => $buyer->email,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'product_name' => $product->name,
            'product_type' => $product->product_type->value,
            'price' => 100.00,
            'commission_rate' => 15.00,
            'commission_amount' => 15.00,
            'vendor_earning' => 85.00,
            'status' => 'completed',
        ]);

        $download = OrderDownload::create([
            'order_item_id' => $orderItem->id,
            'product_file_id' => $product->files()->first()?->id ?? \Illuminate\Support\Str::uuid(),
            'download_token' => 'VALID_TOKEN_BEFORE_REFUND',
            'download_count' => 0,
            'max_downloads' => 5,
            'expires_at' => now()->addDays(7),
        ]);

        $licenseKey = ProductLicenseKey::create([
            'product_id' => $product->id,
            'order_item_id' => $orderItem->id,
            'license_key' => 'TEST-KEY-REFUND',
            'status' => LicenseKeyStatus::ASSIGNED,
            'max_activations' => 1,
            'activation_count' => 0,
            'assigned_at' => now(),
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $buyer->id,
            'payment_method' => 'mock',
            'amount' => 100.00,
            'currency' => 'USD',
            'status' => PaymentStatus::PAID,
        ]);

        // Send Refund Webhook
        $response = $this->postJson('/api/v1/webhooks/payment/mock', [
            'event_id' => 'evt_refund_999',
            'event_type' => 'payment.refunded',
            'payment_id' => $payment->id,
            'amount' => 100.00,
        ]);

        $response->assertStatus(200);

        // Check Order & Payment status
        $order->refresh();
        $payment->refresh();
        $this->assertEquals(PaymentStatus::REFUNDED, $order->payment_status);
        $this->assertEquals(PaymentStatus::REFUNDED, $payment->status);

        // Check download token is expired
        $download->refresh();
        $this->assertTrue($download->isExpired());

        // Check license key is revoked
        $licenseKey->refresh();
        $this->assertEquals(LicenseKeyStatus::REVOKED, $licenseKey->status);

        // Check vendor wallet deducted
        $wallet->refresh();
        $this->assertEquals($initialBalance - 85.00, (float) $wallet->balance);
    }

    public function test_stripe_webhook_invalid_signature_rejected(): void
    {
        config(['payment.gateways.stripe.webhook_secret' => 'whsec_test_secret_12345']);

        $response = $this->withHeaders([
            'Stripe-Signature' => 't=1234567,v1=invalid_signature',
        ])->postJson('/api/v1/webhooks/payment/stripe', [
            'id' => 'evt_stripe_fail_01',
            'type' => 'checkout.session.completed',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Invalid Stripe signature header.']);
    }

    public function test_stripe_webhook_valid_signature_processes_order(): void
    {
        $secret = 'whsec_test_secret_12345';
        config(['payment.gateways.stripe.webhook_secret' => $secret]);

        $buyer = User::where('role', 'buyer')->first() ?? User::factory()->create();
        $product = Product::with('vendor')->first();

        $order = Order::create([
            'order_number' => 'ORD-STRIPE-001',
            'buyer_id' => $buyer->id,
            'subtotal_amount' => $product->effective_price,
            'total_amount' => $product->effective_price,
            'payment_method' => 'stripe',
            'payment_status' => PaymentStatus::PENDING,
            'customer_email' => $buyer->email,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'vendor_id' => $product->vendor_id,
            'product_name' => $product->name,
            'product_type' => $product->product_type->value,
            'price' => $product->effective_price,
            'commission_rate' => 15.00,
            'commission_amount' => 10.00,
            'vendor_earning' => $product->effective_price - 10.00,
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $buyer->id,
            'payment_method' => 'stripe',
            'amount' => $product->effective_price,
            'currency' => 'USD',
            'status' => PaymentStatus::PENDING,
            'gateway_reference' => 'cs_test_session_123',
        ]);

        $payload = json_encode([
            'id' => 'evt_stripe_succ_01',
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_test_session_123',
                    'client_reference_id' => $payment->id,
                    'payment_intent' => 'pi_stripe_123456',
                    'amount_total' => (int) ($product->effective_price * 100),
                ]
            ]
        ]);

        $timestamp = time();
        $signedPayload = "{$timestamp}.{$payload}";
        $signature = hash_hmac('sha256', $signedPayload, $secret);
        $header = "t={$timestamp},v1={$signature}";

        $response = $this->call(
            'POST',
            '/api/v1/webhooks/payment/stripe',
            [],
            [],
            [],
            [
                'HTTP_STRIPE_SIGNATURE' => $header,
                'CONTENT_TYPE' => 'application/json',
            ],
            $payload
        );

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'payment_status' => 'paid',
        ]);

        $order->refresh();
        $payment->refresh();
        $this->assertEquals(PaymentStatus::PAID, $order->payment_status);
        $this->assertEquals(PaymentStatus::PAID, $payment->status);
        $this->assertEquals('pi_stripe_123456', $payment->gateway_transaction_id);
    }

    public function test_payment_status_endpoint_returns_json(): void
    {
        $buyer = User::where('role', 'buyer')->first() ?? User::factory()->create();
        $order = Order::create([
            'order_number' => 'ORD-STATUS-001',
            'buyer_id' => $buyer->id,
            'subtotal_amount' => 25.00,
            'total_amount' => 25.00,
            'payment_method' => 'mock',
            'payment_status' => PaymentStatus::PAID,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => $buyer->id,
            'payment_method' => 'mock',
            'amount' => 25.00,
            'currency' => 'USD',
            'status' => PaymentStatus::PAID,
            'gateway_transaction_id' => 'TXN-999',
        ]);

        $response = $this->getJson("/api/v1/payments/{$payment->id}/status");
        $response->assertStatus(200);
        $response->assertJson([
            'order_status' => 'paid',
            'data' => [
                'id' => $payment->id,
                'order_id' => $order->id,
                'status' => 'paid',
                'amount' => 25.00,
                'gateway_transaction_id' => 'TXN-999',
            ],
        ]);
    }
}
