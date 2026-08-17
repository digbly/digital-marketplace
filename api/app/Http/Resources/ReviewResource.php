<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Review $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "product_id", "buyer_id", "rating", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "product_id", type: "string", format: "uuid"),
        new OA\Property(property: "buyer_id", type: "string", format: "uuid"),
        new OA\Property(property: "rating", type: "integer", example: 5),
        new OA\Property(property: "comment", type: "string", nullable: true),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'product_id' => $this->resource->product_id,
            'buyer_id' => $this->resource->buyer_id,
            'rating' => (int) $this->resource->rating,
            'comment' => $this->resource->comment,
            'created_at' => $this->resource->created_at?->toISOString(),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
        ];
    }
}
