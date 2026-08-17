<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Product $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "vendor_id", "slug", "name", "price", "product_type", "status"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "vendor_id", type: "string", format: "uuid"),
        new OA\Property(property: "category_id", type: "string", format: "uuid", nullable: true),
        new OA\Property(property: "slug", type: "string", example: "tailwind-dashboard-template"),
        new OA\Property(property: "name", type: "string", example: "Tailwind Dashboard Template"),
        new OA\Property(property: "short_description", type: "string", nullable: true),
        new OA\Property(property: "description", type: "string", nullable: true),
        new OA\Property(property: "changelog", type: "string", nullable: true),
        new OA\Property(property: "price", type: "number", format: "float", example: 49.00),
        new OA\Property(property: "sale_price", type: "number", format: "float", nullable: true, example: 29.00),
        new OA\Property(property: "effective_price", type: "number", format: "float", example: 29.00),
        new OA\Property(property: "product_type", type: "string", example: "downloadable_file"),
        new OA\Property(property: "status", type: "string", example: "published"),
        new OA\Property(property: "thumbnail_url", type: "string", nullable: true),
        new OA\Property(property: "preview_images", type: "array", items: new OA\Items(type: "string"), nullable: true),
        new OA\Property(property: "demo_url", type: "string", nullable: true),
        new OA\Property(property: "version", type: "string", example: "1.0.0"),
        new OA\Property(property: "download_limit", type: "integer", nullable: true),
        new OA\Property(property: "expiry_days", type: "integer", nullable: true),
        new OA\Property(property: "total_sales", type: "integer", example: 120),
        new OA\Property(property: "rating_avg", type: "number", format: "float", example: 4.8),
        new OA\Property(property: "rating_count", type: "integer", example: 15),
        new OA\Property(property: "is_featured", type: "boolean"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
    ]
)]
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'vendor_id' => $this->resource->vendor_id,
            'category_id' => $this->resource->category_id,
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
            'short_description' => $this->resource->short_description,
            'description' => $this->resource->description,
            'changelog' => $this->resource->changelog,
            'price' => (float) $this->resource->price,
            'sale_price' => $this->resource->sale_price !== null ? (float) $this->resource->sale_price : null,
            'effective_price' => $this->resource->effective_price,
            'product_type' => $this->resource->product_type?->value ?? (string) $this->resource->product_type,
            'status' => $this->resource->status?->value ?? (string) $this->resource->status,
            'thumbnail_url' => $this->resource->thumbnail_url,
            'preview_images' => $this->resource->preview_images ?? [],
            'demo_url' => $this->resource->demo_url,
            'version' => $this->resource->version,
            'download_limit' => $this->resource->download_limit,
            'expiry_days' => $this->resource->expiry_days,
            'total_sales' => (int) $this->resource->total_sales,
            'rating_avg' => (float) $this->resource->rating_avg,
            'rating_count' => (int) $this->resource->rating_count,
            'is_featured' => (bool) $this->resource->is_featured,
            'attributes' => $this->resource->attributes ?? [],
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
            'vendor' => new VendorResource($this->whenLoaded('vendor')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'files' => ProductFileResource::collection($this->whenLoaded('files')),
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
