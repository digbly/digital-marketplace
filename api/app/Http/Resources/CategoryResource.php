<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Category $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "slug", "name", "is_active"],
    properties: [
        new OA\Property(property: "id", type: "string", format: "uuid"),
        new OA\Property(property: "parent_id", type: "string", format: "uuid", nullable: true),
        new OA\Property(property: "slug", type: "string", example: "wordpress-themes"),
        new OA\Property(property: "name", type: "string", example: "WordPress Themes"),
        new OA\Property(property: "description", type: "string", nullable: true),
        new OA\Property(property: "icon", type: "string", nullable: true),
        new OA\Property(property: "color", type: "string", nullable: true),
        new OA\Property(property: "is_active", type: "boolean"),
        new OA\Property(property: "sort_order", type: "integer"),
    ]
)]
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'parent_id' => $this->resource->parent_id,
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
            'description' => $this->resource->description,
            'icon' => $this->resource->icon,
            'color' => $this->resource->color,
            'is_active' => (bool) $this->resource->is_active,
            'sort_order' => (int) $this->resource->sort_order,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
