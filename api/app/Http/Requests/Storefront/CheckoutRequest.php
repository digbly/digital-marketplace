<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["items", "payment_method"],
    properties: [
        new OA\Property(
            property: "items",
            type: "array",
            items: new OA\Items(
                properties: [
                    new OA\Property(property: "product_id", type: "string", format: "uuid"),
                ],
                type: "object"
            )
        ),
        new OA\Property(property: "payment_method", type: "string", example: "platform_gateway"),
        new OA\Property(property: "discount_code", type: "string", nullable: true),
    ]
)]
class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'string', 'exists:products,id'],
            'payment_method' => ['required', 'string'],
            'discount_code' => ['nullable', 'string', 'max:50'],
        ];
    }
}
