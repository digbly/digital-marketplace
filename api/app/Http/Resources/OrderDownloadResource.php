<?php

namespace App\Http\Resources;

use App\Models\OrderDownload;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read OrderDownload $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "download_token", "download_count", "is_expired"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "order_item_id", type: "string", format: "uuid"),
        new OA\Property(property: "product_file_id", type: "string", format: "uuid"),
        new OA\Property(property: "download_token", type: "string"),
        new OA\Property(property: "download_url", type: "string", example: "/api/buyer/download/abcdef123456"),
        new OA\Property(property: "download_count", type: "integer"),
        new OA\Property(property: "max_downloads", type: "integer", nullable: true),
        new OA\Property(property: "expires_at", type: "string", format: "date-time", nullable: true),
        new OA\Property(property: "is_expired", type: "boolean"),
    ]
)]
class OrderDownloadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'order_item_id' => $this->resource->order_item_id,
            'product_file_id' => $this->resource->product_file_id,
            'download_token' => $this->resource->download_token,
            'download_url' => url('/api/buyer/download/' . $this->resource->download_token),
            'download_count' => (int) $this->resource->download_count,
            'max_downloads' => $this->resource->max_downloads,
            'expires_at' => $this->resource->expires_at?->toISOString(),
            'is_expired' => $this->resource->isExpired(),
            'file' => new ProductFileResource($this->whenLoaded('productFile')),
        ];
    }
}
