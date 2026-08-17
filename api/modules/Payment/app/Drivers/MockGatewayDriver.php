<?php

namespace Modules\Payment\Drivers;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Modules\Payment\Contracts\PaymentGatewayInterface;
use Modules\Payment\DTOs\PaymentInitResponse;
use Modules\Payment\DTOs\RefundResult;
use Modules\Payment\DTOs\WebhookResult;
use Modules\Payment\Models\Payment;

class MockGatewayDriver implements PaymentGatewayInterface
{
    public function __construct(
        protected array $config = []
    ) {}

    public function getName(): string
    {
        return 'mock';
    }

    public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse
    {
        $mockTransactionId = 'MOCK-TXN-' . strtoupper(Str::random(12));
        $mockReference = 'MOCK-REF-' . strtoupper(Str::random(10));

        $payment->update([
            'gateway_transaction_id' => $mockTransactionId,
            'gateway_reference' => $mockReference,
            'gateway_payload' => ['mock_initialized' => true, 'timestamp' => now()->toIso8601String()],
        ]);

        return PaymentInitResponse::success(
            redirectUrl: route('api.payment.mock.return', ['payment_id' => $payment->id]),
            clientSecret: 'mock_sec_' . Str::random(16),
            transactionReference: $mockReference,
            gatewayData: [
                'transaction_id' => $mockTransactionId,
                'mode' => 'mock_simulation',
            ]
        );
    }

    public function verifyWebhook(Request $request): WebhookResult
    {
        $payload = $request->all();
        $eventId = $request->input('event_id', 'mock_evt_' . Str::random(12));
        $eventType = $request->input('event_type', 'payment.success');
        $paymentId = $request->input('payment_id');
        $transactionId = $request->input('transaction_id', 'MOCK-TXN-' . strtoupper(Str::random(12)));
        $reference = $request->input('reference');
        $amount = (float) $request->input('amount', 0.00);

        $status = match ($eventType) {
            'payment.success' => PaymentStatus::PAID,
            'payment.refunded' => PaymentStatus::REFUNDED,
            'payment.failed' => PaymentStatus::FAILED,
            default => PaymentStatus::PENDING,
        };

        return WebhookResult::success(
            gateway: 'mock',
            eventId: $eventId,
            eventType: $eventType,
            gatewayTransactionId: $transactionId,
            gatewayReference: $reference,
            status: $status,
            amount: $amount,
            orderId: $paymentId,
            payload: $payload
        );
    }

    public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult
    {
        $refundTxnId = 'MOCK-REFUND-' . strtoupper(Str::random(12));

        return RefundResult::success(
            refundTransactionId: $refundTxnId,
            refundedAmount: $amount,
            gatewayData: [
                'reason' => $reason,
                'refunded_at' => now()->toIso8601String(),
            ]
        );
    }
}
