<?php

namespace App\Http\Requests\Vendor;

use App\Enums\VendorUserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["email", "role"],
    properties: [
        new OA\Property(property: "email", type: "string", format: "email", example: "developer@example.com"),
        new OA\Property(property: "user_id", type: "string", format: "uuid", nullable: true),
        new OA\Property(property: "role", type: "string", enum: ["owner", "manager", "staff"], example: "staff"),
    ]
)]
class StoreVendorUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required_without:user_id', 'nullable', 'email', 'exists:users,email'],
            'user_id' => ['required_without:email', 'nullable', 'uuid', 'exists:users,id'],
            'role' => ['required', Rule::enum(VendorUserRole::class)],
        ];
    }
}
