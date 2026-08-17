<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApproveVendorRequest;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminVendorController extends Controller
{
    #[OA\Get(
        path: "/api/admin/vendors",
        summary: "List all vendors for admin management",
        security: [["passport" => []]],
        tags: ["Admin - Vendors"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of vendors",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: VendorResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $vendors = Vendor::with('vendorUsers.user')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => VendorResource::collection($vendors->items()),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'total' => $vendors->total(),
            ],
        ]);
    }

    #[OA\Put(
        path: "/api/admin/vendors/{id}/status",
        summary: "Approve, reject, or update vendor status and commission rate",
        security: [["passport" => []]],
        tags: ["Admin - Vendors"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: ApproveVendorRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Vendor status updated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function updateStatus(ApproveVendorRequest $request, string $id): JsonResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update($request->validated());

        return response()->json([
            'message' => 'Vendor status updated successfully',
            'data' => new VendorResource($vendor),
        ]);
    }
}
