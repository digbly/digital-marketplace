<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class AdminAnalyticsController extends Controller
{
    #[OA\Get(
        path: "/api/admin/analytics",
        summary: "Get platform-wide statistics, revenue and performance metrics",
        security: [["passport" => []]],
        tags: ["Admin - Analytics"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Analytics metrics",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "total_revenue", type: "number", format: "float"),
                        new OA\Property(property: "total_commission", type: "number", format: "float"),
                        new OA\Property(property: "total_orders", type: "integer"),
                        new OA\Property(property: "total_products", type: "integer"),
                        new OA\Property(property: "total_vendors", type: "integer"),
                        new OA\Property(property: "total_buyers", type: "integer"),
                    ]
                )
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_amount');
        $totalCommission = OrderItem::sum('commission_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        $totalVendors = Vendor::count();
        $totalBuyers = User::where('role', 'customer')->count();

        $recentOrders = Order::with('buyer')->latest()->limit(5)->get();

        return response()->json([
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'total_commission' => (float) $totalCommission,
                'total_orders' => (int) $totalOrders,
                'total_products' => (int) $totalProducts,
                'total_vendors' => (int) $totalVendors,
                'total_buyers' => (int) $totalBuyers,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }
}
