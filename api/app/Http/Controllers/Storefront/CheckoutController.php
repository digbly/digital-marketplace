<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\CheckoutRequest;
use App\Http\Resources\OrderResource;
use Modules\Payment\Http\Resources\PaymentResource;
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
        summary: "Process checkout for cart items and initiate payment",
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
                description: "Order & payment initialized successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: OrderResource::class),
                        new OA\Property(property: "payment", type: PaymentResource::class),
                        new OA\Property(property: "redirect_url", type: "string", nullable: true),
                        new OA\Property(property: "client_secret", type: "string", nullable: true),
                    ]
                )
            ),
        ]
    )]
    public function checkout(CheckoutRequest $request): JsonResponse
    {
        $user = Auth::user();
        $result = $this->orderService->createOrder(
            $user,
            $request->validated('items'),
            $request->validated('payment_method')
        );

        $order = $result['order'];
        $payment = $result['payment'];
        $initResponse = $result['init_response'];

        return response()->json([
            'message' => $order->payment_status->value === 'paid'
                ? 'Order completed successfully. Your digital assets are ready!'
                : 'Order initialized. Please complete payment.',
            'data' => new OrderResource($order),
            'payment' => new PaymentResource($payment),
            'redirect_url' => $initResponse->redirectUrl,
            'client_secret' => $initResponse->clientSecret,
        ], 201);
    }
}
