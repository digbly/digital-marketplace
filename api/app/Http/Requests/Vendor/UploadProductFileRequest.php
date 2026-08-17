<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["file"],
    properties: [
        new OA\Property(property: "file", type: "string", format: "binary"),
        new OA\Property(property: "version", type: "string", example: "1.0.0"),
        new OA\Property(property: "is_main", type: "boolean"),
    ]
)]
class UploadProductFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:102400'], // 100MB max
            'version' => ['nullable', 'string', 'max:20'],
            'is_main' => ['nullable', 'boolean'],
        ];
    }
}
