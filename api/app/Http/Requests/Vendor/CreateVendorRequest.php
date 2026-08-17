<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["store_name"],
    properties: [
        new OA\Property(property: "store_name", type: "string", example: "CodeCraft Studios"),
        new OA\Property(property: "slug", type: "string", nullable: true, example: "codecraft-studios"),
        new OA\Property(property: "bio", type: "string", nullable: true),
        new OA\Property(property: "logo_url", type: "string", nullable: true),
        new OA\Property(property: "banner_url", type: "string", nullable: true),
        new OA\Property(property: "payout_details", type: "object", nullable: true),
    ]
)]
class CreateVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['required', 'string', 'max:100', 'unique:vendors,store_name'],
            'slug' => ['nullable', 'string', 'max:100', 'unique:vendors,slug'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'logo_url' => ['nullable', 'string', 'url'],
            'banner_url' => ['nullable', 'string', 'url'],
            'payout_details' => ['nullable', 'array'],
        ];
    }
}
