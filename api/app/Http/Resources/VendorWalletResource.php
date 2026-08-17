<?php

namespace App\Http\Resources;

use App\Models\VendorWallet;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read VendorWallet $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "balance", "holding_balance", "total_earned", "total_withdrawn", "currency"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "vendor_id", type: "string", format: "uuid"),
        new OA\Property(property: "balance", type: "number", format: "float", example: 1250.00),
        new OA\Property(property: "holding_balance", type: "number", format: "float", example: 150.00),
        new OA\Property(property: "total_earned", type: "number", format: "float", example: 5000.00),
        new OA\Property(property: "total_withdrawn", type: "number", format: "float", example: 3600.00),
        new OA\Property(property: "currency", type: "string", example: "USD"),
    ]
)]
class VendorWalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'vendor_id' => $this->resource->vendor_id,
            'balance' => (float) $this->resource->balance,
            'holding_balance' => (float) $this->resource->holding_balance,
            'total_earned' => (float) $this->resource->total_earned,
            'total_withdrawn' => (float) $this->resource->total_withdrawn,
            'currency' => $this->resource->currency,
            'transactions' => WalletTransactionResource::collection($this->whenLoaded('transactions')),
        ];
    }
}
