<?php

namespace App\Http\Requests\Buyer;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ["product_id", "rating"],
    properties: [
        new OA\Property(property: "product_id", type: "string", format: "uuid"),
        new OA\Property(property: "order_item_id", type: "string", format: "uuid", nullable: true),
        new OA\Property(property: "rating", type: "integer", minimum: 1, maximum: 5, example: 5),
        new OA\Property(property: "comment", type: "string", nullable: true, example: "Excellent template and clean code!"),
    ]
)]
class CreateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'string', 'exists:products,id'],
            'order_item_id' => ['nullable', 'string', 'exists:order_items,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
