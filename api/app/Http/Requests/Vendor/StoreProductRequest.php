<?php

namespace App\Http\Requests\Vendor;

use App\Enums\ProductType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["name", "price", "product_type"],
    properties: [
        new OA\Property(property: "category_id", type: "string", format: "uuid", nullable: true),
        new OA\Property(property: "name", type: "string", example: "Next.js SaaS Boilerplate"),
        new OA\Property(property: "short_description", type: "string", nullable: true),
        new OA\Property(property: "description", type: "string", nullable: true),
        new OA\Property(property: "price", type: "number", format: "float", example: 59.00),
        new OA\Property(property: "sale_price", type: "number", format: "float", nullable: true),
        new OA\Property(property: "product_type", type: "string", example: "downloadable_file"),
        new OA\Property(property: "thumbnail_url", type: "string", nullable: true),
        new OA\Property(property: "preview_images", type: "array", items: new OA\Items(type: "string"), nullable: true),
        new OA\Property(property: "demo_url", type: "string", nullable: true),
        new OA\Property(property: "version", type: "string", example: "1.0.0"),
        new OA\Property(property: "download_limit", type: "integer", nullable: true),
        new OA\Property(property: "expiry_days", type: "integer", nullable: true),
        new OA\Property(property: "attributes", type: "object", nullable: true),
    ]
)]
class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'string', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'product_type' => ['required', Rule::enum(ProductType::class)],
            'thumbnail_url' => ['nullable', 'string'],
            'preview_images' => ['nullable', 'array'],
            'demo_url' => ['nullable', 'string', 'url'],
            'version' => ['nullable', 'string', 'max:20'],
            'download_limit' => ['nullable', 'integer', 'min:1'],
            'expiry_days' => ['nullable', 'integer', 'min:1'],
            'attributes' => ['nullable', 'array'],
        ];
    }
}
