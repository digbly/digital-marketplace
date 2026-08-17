<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Order $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "order_number", "total_amount", "payment_status", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "order_number", type: "string", example: "ORD-20260817-ABC1"),
        new OA\Property(property: "buyer_id", type: "string", format: "uuid"),
        new OA\Property(property: "subtotal_amount", type: "number", format: "float"),
        new OA\Property(property: "discount_amount", type: "number", format: "float"),
        new OA\Property(property: "total_amount", type: "number", format: "float"),
        new OA\Property(property: "payment_method", type: "string"),
        new OA\Property(property: "payment_status", type: "string", example: "paid"),
        new OA\Property(property: "transaction_id", type: "string", nullable: true),
        new OA\Property(property: "paid_at", type: "string", format: "date-time", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'order_number' => $this->resource->order_number,
            'buyer_id' => $this->resource->buyer_id,
            'subtotal_amount' => (float) $this->resource->subtotal_amount,
            'discount_amount' => (float) $this->resource->discount_amount,
            'total_amount' => (float) $this->resource->total_amount,
            'payment_method' => $this->resource->payment_method,
            'payment_status' => $this->resource->payment_status?->value ?? (string) $this->resource->payment_status,
            'transaction_id' => $this->resource->transaction_id,
            'paid_at' => $this->resource->paid_at?->toISOString(),
            'created_at' => $this->resource->created_at?->toISOString(),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
