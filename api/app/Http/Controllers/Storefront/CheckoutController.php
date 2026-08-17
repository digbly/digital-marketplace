<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class CheckoutController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    #[OA\Post(
        path: "/api/storefront/checkout",
        summary: "Process checkout for cart items",
        security: [["passport" => []]],
        tags: ["Storefront - Checkout"],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: CheckoutRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Order created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: OrderResource::class),
                    ]
                )
            ),
        ]
    )]
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = Auth::user();
        $order = $this->orderService->createOrder(
            $user,
            $request->validated('items'),
            $request->validated('payment_method')
        );

        return response()->json([
            'message' => 'Order completed successfully. Your digital assets are ready!',
            'data' => new OrderResource($order),
        ], 201);
    }
}
