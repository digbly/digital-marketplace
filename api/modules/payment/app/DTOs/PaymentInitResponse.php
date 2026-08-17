<?php

namespace Modules\Payment\DTOs;

class PaymentInitResponse
{
    public function __construct(
        public readonly bool $isSuccessful,
        public readonly ?string $redirectUrl = null,
        public readonly ?string $clientSecret = null,
        public readonly ?string $transactionReference = null,
        public readonly array $gatewayData = [],
        public readonly ?string $errorMessage = null,
    ) {}

    public static function success(
        ?string $redirectUrl = null,
        ?string $clientSecret = null,
        ?string $transactionReference = null,
        array $gatewayData = []
    ): self {
        return new self(
            isSuccessful: true,
            redirectUrl: $redirectUrl,
            clientSecret: $clientSecret,
            transactionReference: $transactionReference,
            gatewayData: $gatewayData
        );
    }

    public static function failed(string $errorMessage, array $gatewayData = []): self
    {
        return new self(
            isSuccessful: false,
            errorMessage: $errorMessage,
            gatewayData: $gatewayData
        );
    }
}
