<?php

namespace App\Http\Resources;

use App\Models\PayoutRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read PayoutRequest $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "vendor_id", "amount", "payout_method", "status", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "vendor_id", type: "string", format: "uuid"),
        new OA\Property(property: "amount", type: "number", format: "float", example: 500.00),
        new OA\Property(property: "payout_method", type: "string", example: "bank_transfer"),
        new OA\Property(property: "payout_account_details", type: "object"),
        new OA\Property(property: "status", type: "string", example: "pending"),
        new OA\Property(property: "admin_note", type: "string", nullable: true),
        new OA\Property(property: "processed_at", type: "string", format: "date-time", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class PayoutRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'vendor_id' => $this->resource->vendor_id,
            'amount' => (float) $this->resource->amount,
            'payout_method' => $this->resource->payout_method,
            'payout_account_details' => $this->resource->payout_account_details,
            'status' => $this->resource->status?->value ?? (string) $this->resource->status,
            'admin_note' => $this->resource->admin_note,
            'processed_at' => $this->resource->processed_at?->toISOString(),
            'created_at' => $this->resource->created_at?->toISOString(),
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
        ];
    }
}
