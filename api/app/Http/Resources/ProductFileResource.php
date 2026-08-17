<?php

namespace App\Http\Resources;

use App\Models\ProductFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read ProductFile $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "file_name", "original_name", "file_size", "version"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "product_id", type: "string", format: "uuid"),
        new OA\Property(property: "file_name", type: "string", example: "theme-bundle-v1.zip"),
        new OA\Property(property: "original_name", type: "string", example: "source_code.zip"),
        new OA\Property(property: "file_size", type: "integer", example: 10485760),
        new OA\Property(property: "mime_type", type: "string", example: "application/zip"),
        new OA\Property(property: "version", type: "string", example: "1.0.0"),
        new OA\Property(property: "is_main", type: "boolean"),
    ]
)]
class ProductFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'product_id' => $this->resource->product_id,
            'file_name' => $this->resource->file_name,
            'original_name' => $this->resource->original_name,
            'file_size' => (int) $this->resource->file_size,
            'mime_type' => $this->resource->mime_type,
            'version' => $this->resource->version,
            'is_main' => (bool) $this->resource->is_main,
        ];
    }
}
