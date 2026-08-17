<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\LicenseKeyStatus;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\ImportLicenseKeysRequest;
use App\Http\Requests\Vendor\StoreProductRequest;
use App\Http\Requests\Vendor\UpdateProductRequest;
use App\Http\Requests\Vendor\UploadProductFileRequest;
use App\Http\Resources\ProductFileResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\ProductLicenseKey;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class VendorProductController extends Controller
{
    #[OA\Get(
        path: "/api/vendors/{vendor}/products",
        summary: "List all products belonging to the specified vendor",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of vendor products",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: ProductResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request, Vendor $vendor): JsonResponse
    {
        $products = Product::with(['category', 'files'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: "/api/vendors/{vendor}/products",
        summary: "Create a new product by vendor",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: StoreProductRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Product created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ProductResource::class),
                    ]
                )
            ),
        ]
    )]
    public function store(StoreProductRequest $request, Vendor $vendor): JsonResponse
    {
        $validated = $request->validated();
        $slug = Str::slug($validated['name'] . '-' . Str::random(5));

        $product = Product::create([
            'vendor_id' => $vendor->id,
            'category_id' => $validated['category_id'],
            'slug' => $slug,
            'price' => $validated['price'],
            'sale_price' => $validated['sale_price'] ?? null,
            'product_type' => $validated['product_type'],
            'status' => ProductStatus::PENDING,
            'thumbnail_url' => $validated['thumbnail_url'] ?? null,
            'preview_images' => $validated['preview_images'] ?? [],
            'demo_url' => $validated['demo_url'] ?? null,
            'version' => $validated['version'] ?? '1.0.0',
            'download_limit' => $validated['download_limit'] ?? null,
            'expiry_days' => $validated['expiry_days'] ?? null,
            'attributes' => $validated['attributes'] ?? null,
        ]);

        $product->translateOrNew('en')->name = $validated['name'];
        $product->translateOrNew('en')->short_description = $validated['short_description'] ?? null;
        $product->translateOrNew('en')->description = $validated['description'] ?? null;
        $product->save();

        return response()->json([
            'message' => 'Product created and submitted for review',
            'data' => new ProductResource($product->load(['category', 'files'])),
        ], 201);
    }

    #[OA\Put(
        path: "/api/vendors/{vendor}/products/{id}",
        summary: "Update existing product",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: UpdateProductRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Product updated successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ProductResource::class),
                    ]
                )
            ),
        ]
    )]
    public function update(UpdateProductRequest $request, Vendor $vendor, string $id): JsonResponse
    {
        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);

        $product->update($request->validated());

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product),
        ]);
    }

    #[OA\Delete(
        path: "/api/vendors/{vendor}/products/{id}",
        summary: "Delete product",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Product deleted successfully"),
        ]
    )]
    public function destroy(Vendor $vendor, string $id): JsonResponse
    {
        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    #[OA\Post(
        path: "/api/vendors/{vendor}/products/{id}/files",
        summary: "Upload digital file for product",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "multipart/form-data",
                    schema: new OA\Schema(
                        type: UploadProductFileRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "File uploaded successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: ProductFileResource::class),
                    ]
                )
            ),
        ]
    )]
    public function uploadFile(UploadProductFileRequest $request, Vendor $vendor, string $id): JsonResponse
    {
        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('digital_assets/' . $product->id, 'local');

        $fileRecord = ProductFile::create([
            'product_id' => $product->id,
            'file_name' => basename($path),
            'original_name' => $uploadedFile->getClientOriginalName(),
            'file_size' => $uploadedFile->getSize(),
            'mime_type' => $uploadedFile->getClientMimeType(),
            'storage_disk' => 'local',
            'storage_path' => $path,
            'version' => $request->input('version', '1.0.0'),
            'is_main' => $request->boolean('is_main', true),
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => new ProductFileResource($fileRecord),
        ], 201);
    }

    #[OA\Post(
        path: "/api/vendors/{vendor}/products/{id}/license-keys",
        summary: "Import license keys into product pool",
        security: [["passport" => []]],
        tags: ["Vendor - Products"],
        parameters: [
            new OA\Parameter(name: "vendor", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: ImportLicenseKeysRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: "License keys imported successfully"),
        ]
    )]
    public function importLicenseKeys(ImportLicenseKeysRequest $request, Vendor $vendor, string $id): JsonResponse
    {
        $product = Product::where('vendor_id', $vendor->id)->findOrFail($id);

        $keys = $request->validated('license_keys');
        $maxActivations = $request->validated('max_activations', 1);
        $expiresAt = $request->validated('expires_at');

        $imported = 0;
        foreach ($keys as $key) {
            ProductLicenseKey::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'license_key' => trim($key),
                ],
                [
                    'status' => LicenseKeyStatus::AVAILABLE,
                    'max_activations' => $maxActivations,
                    'expires_at' => $expiresAt,
                ]
            );
            $imported++;
        }

        return response()->json([
            'message' => "Successfully imported {$imported} license keys.",
        ]);
    }
}
