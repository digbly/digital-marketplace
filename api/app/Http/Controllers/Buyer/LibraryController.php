<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Buyer\CreateReviewRequest;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\ReviewResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Services\DigitalDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LibraryController extends Controller
{
    public function __construct(
        protected DigitalDeliveryService $deliveryService
    ) {}

    #[OA\Get(
        path: "/api/buyer/library",
        summary: "Get buyer's purchased digital items library",
        security: [["passport" => []]],
        tags: ["Buyer - Library"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of purchased items with downloads and license keys",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: OrderItemResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        $userId = Auth::id();

        $items = OrderItem::with(['product.vendor', 'downloads.productFile', 'licenseKey'])
            ->whereHas('order', function ($q) use ($userId) {
                $q->where('buyer_id', $userId)->where('payment_status', 'paid');
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => OrderItemResource::collection($items),
        ]);
    }

    #[OA\Get(
        path: "/api/buyer/download/{token}",
        summary: "Download digital asset via secure token",
        tags: ["Buyer - Library"],
        parameters: [
            new OA\Parameter(name: "token", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Streamed file download"),
            new OA\Response(response: 403, description: "Download expired or limit reached"),
            new OA\Response(response: 404, description: "File not found"),
        ]
    )]
    public function download(string $token): StreamedResponse
    {
        return $this->deliveryService->downloadFile($token);
    }

    #[OA\Post(
        path: "/api/buyer/reviews",
        summary: "Submit product review and rating",
        security: [["passport" => []]],
        tags: ["Buyer - Library"],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: CreateReviewRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Review submitted successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ReviewResource::class),
                    ]
                )
            ),
        ]
    )]
    public function storeReview(CreateReviewRequest $request): JsonResponse
    {
        $userId = Auth::id();

        $review = Review::updateOrCreate(
            [
                'product_id' => $request->validated('product_id'),
                'buyer_id' => $userId,
            ],
            [
                'order_item_id' => $request->validated('order_item_id'),
                'rating' => $request->validated('rating'),
                'comment' => $request->validated('comment'),
                'status' => 'published',
            ]
        );

        // Recalculate average rating for product
        $product = Product::findOrFail($request->validated('product_id'));
        $avg = Review::where('product_id', $product->id)->avg('rating') ?: 0;
        $count = Review::where('product_id', $product->id)->count();

        $product->update([
            'rating_avg' => round($avg, 2),
            'rating_count' => $count,
        ]);

        return response()->json([
            'data' => new ReviewResource($review),
        ], 201);
    }
}
