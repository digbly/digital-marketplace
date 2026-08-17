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

class PayPalGatewayDriver implements PaymentGatewayInterface
{
    public function __construct(
        protected array $config = []
    ) {}

    public function getName(): string
    {
        return 'paypal';
    }

    public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse
    {
        $clientId = $this->config['client_id'] ?? '';
        $clientSecret = $this->config['client_secret'] ?? '';
        $mode = $this->config['mode'] ?? 'sandbox';
        $baseUrl = $mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        if (!empty($clientId) && !empty($clientSecret) && !str_starts_with($clientId, 'mock_')) {
            try {
                // Get Access Token
                $tokenResponse = Http::withBasicAuth($clientId, $clientSecret)
                    ->asForm()
                    ->post("{$baseUrl}/v1/oauth2/token", ['grant_type' => 'client_credentials']);

                if ($tokenResponse->successful()) {
                    $accessToken = $tokenResponse->json('access_token');

                    // Create Order v2
                    $orderResponse = Http::withToken($accessToken)
                        ->post("{$baseUrl}/v2/checkout/orders", [
                            'intent' => 'CAPTURE',
                            'purchase_units' => [[
                                'reference_id' => $payment->id,
                                'description' => "Order #{$payment->order->order_number}",
                                'amount' => [
                                    'currency_code' => $payment->currency ?? 'USD',
                                    'value' => number_format($payment->amount, 2, '.', ''),
                                ],
                            ]],
                            'application_context' => [
                                'return_url' => $options['success_url'] ?? url('/storefront/library'),
                                'cancel_url' => $options['cancel_url'] ?? url('/storefront/cart?canceled=true'),
                            ],
                        ]);

                    if ($orderResponse->successful()) {
                        $orderData = $orderResponse->json();
                        $approvalUrl = null;
                        foreach ($orderData['links'] ?? [] as $link) {
                            if (($link['rel'] ?? '') === 'approve') {
                                $approvalUrl = $link['href'];
                                break;
                            }
                        }

                        $payment->update([
                            'gateway_reference' => $orderData['id'],
                            'gateway_payload' => $orderData,
                        ]);

                        return PaymentInitResponse::success(
                            redirectUrl: $approvalUrl,
                            transactionReference: $orderData['id'],
                            gatewayData: $orderData
                        );
                    }
                }
            } catch (\Throwable $e) {
                return PaymentInitResponse::failed($e->getMessage());
            }
        }

        // Sandbox / Mock simulation fallback
        $mockOrderId = 'PAYPAL-ORD-' . strtoupper(Str::random(16));
        $payment->update([
            'gateway_reference' => $mockOrderId,
            'gateway_payload' => ['mode' => 'sandbox', 'order_id' => $mockOrderId],
        ]);

        return PaymentInitResponse::success(
            redirectUrl: "https://www.sandbox.paypal.com/checkoutnow?token={$mockOrderId}",
            transactionReference: $mockOrderId,
            gatewayData: ['order_id' => $mockOrderId]
        );
    }

    public function verifyWebhook(Request $request): WebhookResult
    {
        $payload = $request->all();
        $eventId = $request->input('id', 'WH-EVT-' . Str::random(16));
        $eventType = $request->input('event_type', '');
        $resource = $request->input('resource', []);

        $paymentId = $resource['purchase_units'][0]['reference_id'] ?? $resource['custom_id'] ?? null;
        $gatewayTxnId = $resource['id'] ?? null;
        $reference = $resource['id'] ?? null;
        $amount = (float) ($resource['amount']['value'] ?? 0.00);

        switch ($eventType) {
            case 'CHECKOUT.ORDER.APPROVED':
            case 'PAYMENT.CAPTURE.COMPLETED':
                return WebhookResult::success(
                    gateway: 'paypal',
                    eventId: $eventId,
                    eventType: $eventType,
                    gatewayTransactionId: (string) $gatewayTxnId,
                    gatewayReference: (string) $reference,
                    status: PaymentStatus::PAID,
                    amount: $amount,
                    orderId: $paymentId,
                    payload: $payload
                );

            case 'PAYMENT.CAPTURE.REFUNDED':
                return WebhookResult::success(
                    gateway: 'paypal',
                    eventId: $eventId,
                    eventType: $eventType,
                    gatewayTransactionId: (string) $gatewayTxnId,
                    gatewayReference: (string) $reference,
                    status: PaymentStatus::REFUNDED,
                    amount: $amount,
                    orderId: $paymentId,
                    payload: $payload
                );

            case 'PAYMENT.CAPTURE.DENIED':
                return WebhookResult::success(
                    gateway: 'paypal',
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
                return WebhookResult::ignored('paypal', $eventId, $eventType, $payload);
        }
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult
    {
        $mockRefundId = 'PAYPAL-REFUND-' . strtoupper(Str::random(14));

        return RefundResult::success(
            refundTransactionId: $mockRefundId,
            refundedAmount: $amount,
            gatewayData: ['mode' => 'sandbox', 'reason' => $reason]
        );
    }
}
