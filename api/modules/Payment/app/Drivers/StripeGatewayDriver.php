<?php

namespace Modules\Payment\Drivers;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Modules\Payment\Contracts\PaymentGatewayInterface;
use Modules\Payment\DTOs\PaymentInitResponse;
use Modules\Payment\DTOs\RefundResult;
use Modules\Payment\DTOs\WebhookResult;
use Modules\Payment\Models\Payment;

class StripeGatewayDriver implements PaymentGatewayInterface
{
    public function __construct(
        protected array $config = []
    ) {}

    public function getName(): string
    {
        return 'stripe';
    }

    public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse
    {
        $secretKey = $this->config['secret'] ?? '';
        $currency = strtolower($this->config['currency'] ?? 'usd');

        // If live secret key is configured, create real Stripe Checkout Session
        if (!empty($secretKey) && !str_starts_with($secretKey, 'mock_')) {
            try {
                $response = Http::withToken($secretKey)
                    ->asForm()
                    ->post('https://api.stripe.com/v1/checkout/sessions', [
                        'payment_method_types' => ['card'],
                        'mode' => 'payment',
                        'client_reference_id' => $payment->id,
                        'customer_email' => $payment->user?->email,
                        'line_items[0][price_data][currency]' => $currency,
                        'line_items[0][price_data][unit_amount]' => (int) round($payment->amount * 100),
                        'line_items[0][price_data][product_data][name]' => "Order #{$payment->order->order_number}",
                        'line_items[0][quantity]' => 1,
                        'success_url' => $options['success_url'] ?? url('/storefront/library?session_id={CHECKOUT_SESSION_ID}'),
                        'cancel_url' => $options['cancel_url'] ?? url('/storefront/cart?canceled=true'),
                    ]);

                if ($response->successful()) {
                    $session = $response->json();
                    $payment->update([
                        'gateway_reference' => $session['id'],
                        'gateway_payload' => $session,
                    ]);

                    return PaymentInitResponse::success(
                        redirectUrl: $session['url'] ?? null,
                        clientSecret: $session['client_secret'] ?? null,
                        transactionReference: $session['id'],
                        gatewayData: $session
                    );
                }

                return PaymentInitResponse::failed($response->json('error.message', 'Failed to create Stripe checkout session.'));
            } catch (\Throwable $e) {
                return PaymentInitResponse::failed($e->getMessage());
            }
        }

        // Sandbox / Test fallback session
        $mockSessionId = 'cs_test_' . Str::random(24);
        $payment->update([
            'gateway_reference' => $mockSessionId,
            'gateway_payload' => ['mode' => 'sandbox', 'session_id' => $mockSessionId],
        ]);

        return PaymentInitResponse::success(
            redirectUrl: "https://checkout.stripe.com/pay/{$mockSessionId}",
            clientSecret: 'pi_test_' . Str::random(20) . '_secret_' . Str::random(16),
            transactionReference: $mockSessionId,
            gatewayData: ['session_id' => $mockSessionId]
        );
    }

    public function verifyWebhook(Request $request): WebhookResult
    {
        $payload = $request->all();
        $rawContent = $request->getContent();
        $signatureHeader = $request->header('Stripe-Signature');
        $webhookSecret = $this->config['webhook_secret'] ?? '';

        // Validate webhook signature if secret & header provided
        if (!empty($webhookSecret) && !empty($signatureHeader)) {
            $isValid = $this->validateStripeSignature($rawContent, $signatureHeader, $webhookSecret);
            if (!$isValid) {
                return WebhookResult::invalid('stripe', 'Invalid Stripe signature header.', $payload);
            }
        }

        $eventId = $request->input('id', 'evt_' . Str::random(20));
        $eventType = $request->input('type', '');
        $dataObject = $request->input('data.object', []);

        $paymentId = $dataObject['client_reference_id'] ?? $dataObject['metadata']['payment_id'] ?? null;
        $gatewayTxnId = $dataObject['payment_intent'] ?? $dataObject['id'] ?? null;
        $reference = $dataObject['id'] ?? null;
        $amount = isset($dataObject['amount_total']) ? ((float) $dataObject['amount_total']) / 100 : (float) ($dataObject['amount'] ?? 0) / 100;

        switch ($eventType) {
            case 'checkout.session.completed':
            case 'payment_intent.succeeded':
                return WebhookResult::success(
                    gateway: 'stripe',
                    eventId: $eventId,
                    eventType: $eventType,
                    gatewayTransactionId: (string) $gatewayTxnId,
                    gatewayReference: (string) $reference,
                    status: PaymentStatus::PAID,
                    amount: $amount,
                    orderId: $paymentId,
                    payload: $payload
                );

            case 'charge.refunded':
                return WebhookResult::success(
                    gateway: 'stripe',
                    eventId: $eventId,
                    eventType: $eventType,
                    gatewayTransactionId: (string) $gatewayTxnId,
                    gatewayReference: (string) $reference,
                    status: PaymentStatus::REFUNDED,
                    amount: $amount,
                    orderId: $paymentId,
                    payload: $payload
                );

            case 'payment_intent.payment_failed':
                return WebhookResult::success(
                    gateway: 'stripe',
                    eventId: $eventId,
                    eventType: $eventType,
                    gatewayTransactionId: (string) $gatewayTxnId,
                    gatewayReference: (string) $reference,
                    status: PaymentStatus::FAILED,
                    amount: $amount,
                    orderId: $paymentId,
                    payload: $payload
                );

            default:
                return WebhookResult::ignored('stripe', $eventId, $eventType, $payload);
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult
    {
        $secretKey = $this->config['secret'] ?? '';

        if (!empty($secretKey) && !str_starts_with($secretKey, 'mock_') && !empty($payment->gateway_transaction_id)) {
            try {
                $response = Http::withToken($secretKey)
                    ->asForm()
                    ->post('https://api.stripe.com/v1/refunds', [
                        'payment_intent' => $payment->gateway_transaction_id,
                        'amount' => (int) round($amount * 100),
                        'reason' => $reason ? 'requested_by_customer' : null,
                    ]);

                if ($response->successful()) {
                    $refundData = $response->json();
                    return RefundResult::success(
                        refundTransactionId: $refundData['id'],
                        refundedAmount: ((float) $refundData['amount']) / 100,
                        gatewayData: $refundData
                    );
                }

                return RefundResult::failed($response->json('error.message', 'Stripe refund failed.'));
            } catch (\Throwable $e) {
                return RefundResult::failed($e->getMessage());
            }
        }

        // Mock refund fallback
        $mockRefundId = 're_test_' . Str::random(20);
        return RefundResult::success(
            refundTransactionId: $mockRefundId,
            refundedAmount: $amount,
            gatewayData: ['mode' => 'sandbox', 'reason' => $reason]
        );
    }

    protected function validateStripeSignature(string $payload, string $header, string $secret): bool
    {
        $items = explode(',', $header);
        $timestamp = null;
        $signatures = [];

        foreach ($items as $item) {
            $parts = explode('=', trim($item), 2);
            if (count($parts) === 2) {
                if ($parts[0] === 't') {
                    $timestamp = $parts[1];
                } elseif ($parts[0] === 'v1') {
                    $signatures[] = $parts[1];
                }
            }
        }

        if (!$timestamp || empty($signatures)) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > 600) {
            return false;
        }

        $signedPayload = "{$timestamp}.{$payload}";
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        foreach ($signatures as $sig) {
            if (hash_equals($expectedSignature, $sig)) {
                return true;
            }
        }

        return false;
    }
}
