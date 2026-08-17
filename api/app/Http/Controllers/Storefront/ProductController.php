<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: "/api/storefront/products",
        summary: "List published products with search and filtering",
        tags: ["Storefront - Products"],
        parameters: [
            new OA\Parameter(name: "search", in: "query", schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "category_id", in: "query", schema: new OA\Schema(type: "string", format: "uuid")),
            new OA\Parameter(name: "product_type", in: "query", schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "is_featured", in: "query", schema: new OA\Schema(type: "boolean")),
            new OA\Parameter(name: "sort_by", in: "query", schema: new OA\Schema(type: "string", enum: ["newest", "popular", "price_asc", "price_desc", "rating"])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of products",
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
        $query = Product::with(['vendor', 'category.translations', 'translations'])
            ->where('status', ProductStatus::PUBLISHED);

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereTranslationLike('name', "%{$search}%");
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->filled('product_type')) {
            $query->where('product_type', $request->query('product_type'));
        }

        if ($request->boolean('is_featured')) {
            $query->where('is_featured', true);
        }

        $sortBy = $request->query('sort_by', 'newest');
        match ($sortBy) {
            'popular' => $query->orderByDesc('total_sales'),
            'rating' => $query->orderByDesc('rating_avg'),
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            default => $query->latest(),
        };

        $products = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: "/api/storefront/products/{slug}",
        summary: "Get single product detail by slug",
        tags: ["Storefront - Products"],
        parameters: [
            new OA\Parameter(name: "slug", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Product details",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ProductResource::class),
                    ]
                )
            ),
            new OA\Response(response: 404, description: "Product not found"),
        ]
    )]
    public function show(string $slug): JsonResponse
    {
        $product = Product::with(['vendor', 'category.translations', 'reviews.buyer', 'translations'])
            ->where('slug', $slug)
            ->where('status', ProductStatus::PUBLISHED)
            ->firstOrFail();

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }
}
