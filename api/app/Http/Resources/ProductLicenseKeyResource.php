<?php

namespace App\Http\Resources;

use App\Models\ProductLicenseKey;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read ProductLicenseKey $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "license_key", "status", "max_activations", "activation_count"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "product_id", type: "string", format: "uuid"),
        new OA\Property(property: "license_key", type: "string", example: "ABCD-1234-EFGH-5678"),
        new OA\Property(property: "status", type: "string", example: "available"),
        new OA\Property(property: "max_activations", type: "integer", example: 1),
        new OA\Property(property: "activation_count", type: "integer", example: 0),
        new OA\Property(property: "assigned_at", type: "string", format: "date-time", nullable: true),
        new OA\Property(property: "expires_at", type: "string", format: "date-time", nullable: true),
    ]
)]
class ProductLicenseKeyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'product_id' => $this->resource->product_id,
            'license_key' => $this->resource->license_key,
            'status' => $this->resource->status?->value ?? (string) $this->resource->status,
            'max_activations' => (int) $this->resource->max_activations,
            'activation_count' => (int) $this->resource->activation_count,
            'assigned_at' => $this->resource->assigned_at?->toISOString(),
            'expires_at' => $this->resource->expires_at?->toISOString(),
        ];
    }
}
