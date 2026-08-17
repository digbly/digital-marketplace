<?php

namespace App\Http\Requests\Admin;

use App\Enums\PayoutStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["status"],
    properties: [
        new OA\Property(property: "status", type: "string", example: "processed"),
        new OA\Property(property: "admin_note", type: "string", nullable: true, example: "Transferred via wire transaction #TXN998811"),
    ]
)]
class ProcessPayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(PayoutStatus::class)],
            'admin_note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
