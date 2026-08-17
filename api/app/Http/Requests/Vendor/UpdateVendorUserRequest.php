<?php

namespace App\Http\Requests\Vendor;

use App\Enums\VendorUserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["role"],
    properties: [
        new OA\Property(property: "role", type: "string", enum: ["owner", "manager", "staff"], example: "manager"),
    ]
)]
class UpdateVendorUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', Rule::enum(VendorUserRole::class)],
        ];
    }
}
