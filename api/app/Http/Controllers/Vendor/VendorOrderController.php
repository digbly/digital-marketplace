<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderItemResource;
use App\Models\OrderItem;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class VendorOrderController extends Controller
{
    #[OA\Get(
        path: "/api/vendor/orders",
        summary: "List all sold items and customer orders for the vendor",
        security: [["passport" => []]],
        tags: ["Vendor - Orders"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of order items",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: OrderItemResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['data' => []]);
        }

        $items = OrderItem::with(['order.buyer', 'product'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => OrderItemResource::collection($items->items()),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ],
        ]);
    }
}
