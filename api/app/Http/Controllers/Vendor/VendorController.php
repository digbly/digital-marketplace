<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Enums\VendorUserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\CreateVendorRequest;
use App\Http\Requests\Vendor\StoreVendorProfileRequest;
use App\Http\Resources\VendorResource;
use App\Models\Vendor;
use App\Models\VendorUser;
use App\Models\VendorWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class VendorController extends Controller
{
    #[OA\Get(
        path: "/api/vendors",
        summary: "List all vendors the authenticated user belongs to",
        security: [["passport" => []]],
        tags: ["Vendor - Management"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of user vendors",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(type: VendorResource::class)
                        ),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $vendors = $request->user()->vendors()->with(['vendorUsers.user'])->get();

        return response()->json([
            'data' => VendorResource::collection($vendors),
        ]);
    }

    #[OA\Post(
        path: "/api/vendors",
        summary: "Create a new vendor store",
        security: [["passport" => []]],
        tags: ["Vendor - Management"],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: CreateVendorRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Vendor created successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function store(CreateVendorRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $vendor = DB::transaction(function () use ($user, $validated) {
            $slug = ! empty($validated['slug'])
                ? Str::slug($validated['slug'])
                : Str::slug($validated['store_name'] . '-' . Str::random(5));

            $vendor = Vendor::create([
                'store_name' => $validated['store_name'],
                'slug' => $slug,
                'bio' => $validated['bio'] ?? null,
                'logo_url' => $validated['logo_url'] ?? null,
                'banner_url' => $validated['banner_url'] ?? null,
                'payout_details' => $validated['payout_details'] ?? null,
                'status' => VendorStatus::APPROVED,
            ]);

            // Add creating user as OWNER
            VendorUser::create([
                'vendor_id' => $vendor->id,
                'user_id' => $user->id,
                'role' => VendorUserRole::OWNER,
            ]);

            // Create Vendor Wallet
            VendorWallet::create([
                'vendor_id' => $vendor->id,
                'balance' => 0.00,
                'holding_balance' => 0.00,
                'total_earned' => 0.00,
                'total_withdrawn' => 0.00,
                'currency' => 'USD',
            ]);

            // Update user role to VENDOR if they are CUSTOMER
            if ($user->role === UserRole::CUSTOMER) {
                $user->update(['role' => UserRole::VENDOR]);
            }

            return $vendor;
        });

        $vendor->load('vendorUsers.user');

        return response()->json([
            'message' => 'Vendor created successfully',
            'data' => new VendorResource($vendor),
        ], 201);
    }

    #[OA\Get(
        path: "/api/vendors/{vendor}",
        summary: "Get vendor store profile",
        security: [["passport" => []]],
        tags: ["Vendor - Management"],
        parameters: [
            new OA\Parameter(
                name: "vendor",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Vendor details",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function show(Vendor $vendor): JsonResponse
    {
        $vendor->load('vendorUsers.user');

        return response()->json([
            'data' => new VendorResource($vendor),
        ]);
    }

    #[OA\Put(
        path: "/api/vendors/{vendor}",
        summary: "Update vendor store profile",
        security: [["passport" => []]],
        tags: ["Vendor - Management"],
        parameters: [
            new OA\Parameter(
                name: "vendor",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
        ],
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
                description: "Vendor updated successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: VendorResource::class),
                    ]
                )
            ),
        ]
    )]
    public function update(StoreVendorProfileRequest $request, Vendor $vendor): JsonResponse
    {
        $vendor->update($request->validated());

        return response()->json([
            'message' => 'Vendor profile updated successfully',
            'data' => new VendorResource($vendor),
        ]);
    }
}
