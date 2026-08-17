<?php

namespace App\Http\Resources;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Vendor $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "store_name", "slug", "status", "created_at"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "store_name", type: "string", example: "Elite Themes"),
        new OA\Property(property: "slug", type: "string", example: "elite-themes"),
        new OA\Property(property: "bio", type: "string", nullable: true),
        new OA\Property(property: "logo_url", type: "string", nullable: true),
        new OA\Property(property: "banner_url", type: "string", nullable: true),
        new OA\Property(property: "commission_rate", type: "number", format: "float", nullable: true),
        new OA\Property(property: "status", type: "string", example: "approved"),
        new OA\Property(property: "current_user_role", type: "string", nullable: true, example: "owner"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
class VendorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $currentUserRole = null;
        if ($request->user()) {
            if ($this->resource->pivot && isset($this->resource->pivot->role)) {
                $currentUserRole = $this->resource->pivot->role;
            } else {
                $currentUserRole = $this->resource->getUserRole($request->user())?->value;
            }
        }

        return [
            'id' => $this->resource->id,
            'store_name' => $this->resource->store_name,
            'slug' => $this->resource->slug,
            'bio' => $this->resource->bio,
            'logo_url' => $this->resource->logo_url,
            'banner_url' => $this->resource->banner_url,
            'commission_rate' => $this->resource->commission_rate,
            'status' => $this->resource->status?->value ?? (string) $this->resource->status,
            'current_user_role' => $currentUserRole,
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
            'members' => VendorUserResource::collection($this->whenLoaded('vendorUsers')),
        ];
    }
}
