<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["license_keys"],
    properties: [
        new OA\Property(
            property: "license_keys",
            type: "array",
            items: new OA\Items(type: "string"),
            example: ["KEY-1111-2222", "KEY-3333-4444"]
        ),
        new OA\Property(property: "max_activations", type: "integer", example: 1),
        new OA\Property(property: "expires_at", type: "string", format: "date-time", nullable: true),
    ]
)]
class ImportLicenseKeysRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'license_keys' => ['required', 'array', 'min:1'],
            'license_keys.*' => ['required', 'string', 'distinct'],
            'max_activations' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
        ];
    }
}
