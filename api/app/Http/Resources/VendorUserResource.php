<?php

namespace App\Http\Resources;

use App\Models\VendorUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read VendorUser $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "vendor_id", "user_id", "role", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "vendor_id", type: "string", format: "uuid"),
        new OA\Property(property: "user_id", type: "string", format: "uuid"),
        new OA\Property(property: "role", type: "string", example: "manager"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
        new OA\Property(property: "user", type: UserResource::class),
    ]
)]
class VendorUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'vendor_id' => $this->resource->vendor_id,
            'user_id' => $this->resource->user_id,
            'role' => $this->resource->role?->value ?? (string) $this->resource->role,
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
