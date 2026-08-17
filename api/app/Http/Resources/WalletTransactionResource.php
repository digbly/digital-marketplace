<?php

namespace App\Http\Resources;

use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read WalletTransaction $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "type", "amount", "balance_after", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "wallet_id", type: "string", format: "uuid"),
        new OA\Property(property: "type", type: "string", example: "order_earning"),
        new OA\Property(property: "amount", type: "number", format: "float", example: 45.00),
        new OA\Property(property: "balance_before", type: "number", format: "float"),
        new OA\Property(property: "balance_after", type: "number", format: "float"),
        new OA\Property(property: "description", type: "string", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class WalletTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'wallet_id' => $this->resource->wallet_id,
            'type' => $this->resource->type?->value ?? (string) $this->resource->type,
            'amount' => (float) $this->resource->amount,
            'balance_before' => (float) $this->resource->balance_before,
            'balance_after' => (float) $this->resource->balance_after,
            'description' => $this->resource->description,
            'created_at' => $this->resource->created_at?->toISOString(),
        ];
    }
}
