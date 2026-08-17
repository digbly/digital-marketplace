<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read User $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ["id", "name", "email", "role", "status", "created_at", "updated_at"],
    properties: [
        new OA\Property(
            property: "id",
            type: "string",
            format: "uuid",
            example: "9c3c6f1a-6df7-4b1e-b8eb-9d8e6c7d9a10"
        ),
        new OA\Property(
            property: "name",
            type: "string",
            example: "John Doe"
        ),
        new OA\Property(
            property: "email",
            type: "string",
            format: "email",
            example: "john@example.com"
        ),
        new OA\Property(
            property: "role",
            type: "string",
            example: "customer"
        ),
        new OA\Property(
            property: "status",
            type: "string",
            example: "active"
        ),
        new OA\Property(
            property: "avatar",
            type: "string",
            nullable: true,
            example: "https://example.com/avatar.jpg"
        ),
        new OA\Property(
            property: "email_verified_at",
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-08-16T09:00:00.000000Z"
        ),
        new OA\Property(
            property: "created_at",
            type: "string",
            format: "date-time",
            example: "2026-08-16T09:00:00.000000Z"
        ),
        new OA\Property(
            property: "updated_at",
            type: "string",
            format: "date-time",
            example: "2026-08-16T09:00:00.000000Z"
        ),
    ]
)]
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'role' => $this->resource->role?->value ?? (string) $this->resource->role,
            'status' => $this->resource->status,
            'avatar' => $this->resource->avatar,
            'email_verified_at' => $this->resource->email_verified_at?->toISOString(),
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
        ];
    }
}
