<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["status"],
    properties: [
        new OA\Property(property: "status", type: "string", example: "published"),
        new OA\Property(property: "is_featured", type: "boolean", nullable: true),
    ]
)]
class ModerateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }
}
