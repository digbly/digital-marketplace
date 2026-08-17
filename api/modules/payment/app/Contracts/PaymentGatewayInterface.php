<?php

namespace Modules\Payment\Contracts;

use Illuminate\Http\Request;
use Modules\Payment\DTOs\PaymentInitResponse;
use Modules\Payment\DTOs\RefundResult;
use Modules\Payment\DTOs\WebhookResult;
use Modules\Payment\Models\Payment;

interface PaymentGatewayInterface
{
    /**
     * Get the identifier name of this payment gateway.
     */
    public function getName(): string;

    /**
     * Initiate payment session/intent for the given payment record.
     */
    public function initiatePayment(Payment $payment, array $options = []): PaymentInitResponse;

    /**
     * Verify incoming webhook request and parse into WebhookResult.
     */
    public function verifyWebhook(Request $request): WebhookResult;

    /**
     * Process refund for a previously settled payment.
     */
    public function refund(Payment $payment, float $amount, ?string $reason = null): RefundResult;
}
