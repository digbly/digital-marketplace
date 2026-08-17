<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorProfileRequest;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class VendorProfileController extends Controller
{
    #[OA\Get(
        path: "/api/vendor/profile",
        summary: "Get current vendor profile settings",
        security: [["passport" => []]],
        tags: ["Vendor - Profile"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Vendor profile",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function show(): JsonResponse
    {
        $vendor = Vendor::firstOrCreate(
            ['user_id' => Auth::id()],
            [
                'store_name' => Auth::user()->name . "'s Store",
                'slug' => Str::slug(Auth::user()->name . '-' . Str::random(5)),
                'status' => 'approved',
            ]
        );

        return response()->json([
            'data' => new VendorResource($vendor),
        ]);
    }

    #[OA\Put(
        path: "/api/vendor/profile",
        summary: "Update current vendor profile settings",
        security: [["passport" => []]],
        tags: ["Vendor - Profile"],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: StoreVendorProfileRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Vendor profile updated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function update(StoreVendorProfileRequest $request): JsonResponse
    {
        $vendor = Vendor::firstOrCreate(['user_id' => Auth::id()]);
        $vendor->update($request->validated());

        return response()->json([
            'message' => 'Store profile updated successfully',
            'data' => new VendorResource($vendor),
        ]);
    }
}
