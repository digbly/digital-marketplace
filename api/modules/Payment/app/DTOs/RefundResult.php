<?php

namespace Modules\Payment\DTOs;

class RefundResult
{
    public function __construct(
        public readonly bool $isSuccess,
        public readonly ?string $refundTransactionId = null,
        public readonly float $refundedAmount = 0.00,
        public readonly array $gatewayData = [],
        public readonly ?string $errorMessage = null,
    ) {}

    public static function success(
        string $refundTransactionId,
        float $refundedAmount,
        array $gatewayData = []
    ): self {
        return new self(
            isSuccess: true,
            refundTransactionId: $refundTransactionId,
            refundedAmount: $refundedAmount,
            gatewayData: $gatewayData
        );
    }

    public static function failed(string $errorMessage, array $gatewayData = []): self
    {
        return new self(
            isSuccess: false,
            errorMessage: $errorMessage,
            gatewayData: $gatewayData
        );
    }
}
