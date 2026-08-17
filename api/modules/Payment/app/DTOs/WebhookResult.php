<?php

namespace Modules\Payment\DTOs;

use App\Enums\PaymentStatus;

class WebhookResult
{
    public function __construct(
        public readonly bool $isValid,
        public readonly string $gateway,
        public readonly string $eventId,
        public readonly ?string $eventType = null,
        public readonly ?string $gatewayTransactionId = null,
        public readonly ?string $gatewayReference = null,
        public readonly ?string $orderId = null,
        public readonly ?PaymentStatus $status = null,
        public readonly ?float $amount = null,
        public readonly array $payload = [],
        public readonly ?string $errorMessage = null,
    ) {}

    public static function success(
        string $gateway,
        string $eventId,
        string $eventType,
        string $gatewayTransactionId,
        ?string $gatewayReference,
        PaymentStatus $status,
        ?float $amount = null,
        ?string $orderId = null,
        array $payload = []
    ): self {
        return new self(
            isValid: true,
            gateway: $gateway,
            eventId: $eventId,
            eventType: $eventType,
            gatewayTransactionId: $gatewayTransactionId,
            gatewayReference: $gatewayReference,
            orderId: $orderId,
            status: $status,
            amount: $amount,
            payload: $payload
        );
    }

    public static function invalid(string $gateway, string $errorMessage, array $payload = []): self
    {
        return new self(
            isValid: false,
            gateway: $gateway,
            eventId: 'invalid_' . uniqid(),
            errorMessage: $errorMessage,
            payload: $payload
        );
    }

    public static function ignored(string $gateway, string $eventId, string $eventType, array $payload = []): self
    {
        return new self(
            isValid: true,
            gateway: $gateway,
            eventId: $eventId,
            eventType: $eventType,
            status: null,
            payload: $payload
        );
    }
}
