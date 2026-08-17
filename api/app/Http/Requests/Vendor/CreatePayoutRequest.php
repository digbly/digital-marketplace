<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["amount", "payout_method", "payout_account_details"],
    properties: [
        new OA\Property(property: "amount", type: "number", format: "float", example: 250.00),
        new OA\Property(property: "payout_method", type: "string", example: "bank_transfer"),
        new OA\Property(property: "payout_account_details", type: "object"),
    ]
)]
class CreatePayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:10'],
            'payout_method' => ['required', 'string'],
            'payout_account_details' => ['required', 'array'],
        ];
    }
}
