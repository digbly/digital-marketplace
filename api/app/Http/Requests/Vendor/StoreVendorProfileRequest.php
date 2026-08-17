<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["store_name"],
    properties: [
        new OA\Property(property: "store_name", type: "string", example: "Pixel Perfect Design"),
        new OA\Property(property: "bio", type: "string", nullable: true),
        new OA\Property(property: "logo_url", type: "string", nullable: true),
        new OA\Property(property: "banner_url", type: "string", nullable: true),
        new OA\Property(property: "payout_details", type: "object", nullable: true),
    ]
)]
class StoreVendorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => ['required', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'logo_url' => ['nullable', 'string', 'url'],
            'banner_url' => ['nullable', 'string', 'url'],
            'payout_details' => ['nullable', 'array'],
        ];
    }
}
