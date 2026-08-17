<?php

namespace App\Http\Requests\Admin;

use App\Enums\VendorStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["status"],
    properties: [
        new OA\Property(property: "status", type: "string", example: "approved"),
        new OA\Property(property: "commission_rate", type: "number", format: "float", nullable: true, example: 10.0),
    ]
)]
class ApproveVendorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(VendorStatus::class)],
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
