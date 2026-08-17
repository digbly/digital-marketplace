<?php

namespace Tests\Unit;

use Illuminate\Http\Request;
use Modules\Payment\Contracts\PaymentGatewayInterface;
use Modules\Payment\DTOs\PaymentInitResponse;
use Modules\Payment\DTOs\RefundResult;
use Modules\Payment\DTOs\WebhookResult;
use Modules\Payment\Drivers\MockGatewayDriver;
use Modules\Payment\Drivers\PayPalGatewayDriver;
use Modules\Payment\Drivers\StripeGatewayDriver;
use Modules\Payment\Models\Payment;
use Modules\Payment\Services\PaymentManager;
use Tests\TestCase;

class PaymentManagerTest extends TestCase
{
    public function test_can_resolve_default_mock_driver(): void
    {
        $manager = app(PaymentManager::class);
        $driver = $manager->driver();

        $this->assertInstanceOf(PaymentGatewayInterface::class, $driver);
        $this->assertInstanceOf(MockGatewayDriver::class, $driver);
        $this->assertEquals('mock', $driver->getName());
    }

    public function test_can_resolve_stripe_and_paypal_drivers(): void
    {
        $manager = app(PaymentManager::class);

        $stripe = $manager->driver('stripe');
        $this->assertInstanceOf(StripeGatewayDriver::class, $stripe);
        $this->assertEquals('stripe', $stripe->getName());

        $paypal = $manager->driver('paypal');
        $this->assertInstanceOf(PayPalGatewayDriver::class, $paypal);
        $this->assertEquals('paypal', $paypal->getName());
    }

    public function test_can_register_and_resolve_custom_driver(): void
    {
        $manager = app(PaymentManager::class);

        $mockCustomDriver = new class implements PaymentGatewayInterface {
            public function getName(): string { return 'custom_gateway'; }
            public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse {
                return PaymentInitResponse::success('https://custom.pay');
            }
            public function verifyWebhook(Request $request): WebhookResult {
                return WebhookResult::ignored('custom', 'evt_1', 'test');
            }
            public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult {
                return RefundResult::success('ref_1', $amount);
            }
        };

        $manager->extend('custom_gateway', function () use ($mockCustomDriver) {
            return $mockCustomDriver;
        });

        $resolved = $manager->driver('custom_gateway');
        $this->assertEquals('custom_gateway', $resolved->getName());
    }
}
