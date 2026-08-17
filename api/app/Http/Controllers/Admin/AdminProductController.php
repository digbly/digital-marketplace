<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminProductController extends Controller
{
    #[OA\Get(
        path: "/api/admin/products",
        summary: "List all products for moderation across all vendors",
        security: [["passport" => []]],
        tags: ["Admin - Products"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of all products",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: ProductResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['vendor.vendorUsers', 'category.translations', 'translations'])
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    #[OA\Put(
        path: "/api/admin/products/{id}/moderate",
        summary: "Moderate product status (published/rejected/featured)",
        security: [["passport" => []]],
        tags: ["Admin - Products"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: ModerateProductRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Product moderation updated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ProductResource::class),
                    ]
                )
            ),
        ]
    )]
    public function moderate(ModerateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return response()->json([
            'message' => 'Product status updated successfully',
            'data' => new ProductResource($product),
        ]);
    }
}
