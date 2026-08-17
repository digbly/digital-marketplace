<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\VendorUserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorUserRequest;
use App\Http\Requests\Vendor\UpdateVendorUserRequest;
use App\Http\Resources\VendorUserResource;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class VendorMemberController extends Controller
{
    #[OA\Get(
        path: "/api/vendors/{vendor}/members",
        summary: "List all members of the vendor store",
        security: [["passport" => []]],
        tags: ["Vendor - Members"],
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
                description: "List of vendor members",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(type: VendorUserResource::class)
                        ),
                    ]
                )
            ),
        ]
    )]
    public function index(Vendor $vendor): JsonResponse
    {
        $members = $vendor->vendorUsers()->with('user')->get();

        return response()->json([
            'data' => VendorUserResource::collection($members),
        ]);
    }

    #[OA\Post(
        path: "/api/vendors/{vendor}/members",
        summary: "Add a new member to the vendor store",
        security: [["passport" => []]],
        tags: ["Vendor - Members"],
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
                        type: StoreVendorUserRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Member added successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: VendorUserResource::class),
                    ]
                )
            ),
        ]
    )]
    public function store(StoreVendorUserRequest $request, Vendor $vendor): JsonResponse
    {
        $validated = $request->validated();

        $targetUser = null;
        if (! empty($validated['email'])) {
            $targetUser = User::where('email', $validated['email'])->firstOrFail();
        } elseif (! empty($validated['user_id'])) {
            $targetUser = User::findOrFail($validated['user_id']);
        }

        if ($vendor->hasMember($targetUser)) {
            return response()->json([
                'message' => 'User is already a member of this vendor store.',
            ], 422);
        }

        $vendorUser = VendorUser::create([
            'vendor_id' => $vendor->id,
            'user_id' => $targetUser->id,
            'role' => $validated['role'],
        ]);

        $vendorUser->load('user');

        return response()->json([
            'message' => 'Member added successfully',
            'data' => new VendorUserResource($vendorUser),
        ], 201);
    }

    #[OA\Put(
        path: "/api/vendors/{vendor}/members/{user}",
        summary: "Update a member's role in the vendor store",
        security: [["passport" => []]],
        tags: ["Vendor - Members"],
        parameters: [
            new OA\Parameter(
                name: "vendor",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "user",
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
                        type: UpdateVendorUserRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Member role updated successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: VendorUserResource::class),
                    ]
                )
            ),
        ]
    )]
    public function update(UpdateVendorUserRequest $request, Vendor $vendor, User $user): JsonResponse
    {
        $vendorUser = VendorUser::where('vendor_id', $vendor->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $vendorUser) {
            return response()->json([
                'message' => 'Member not found in this vendor store.',
            ], 404);
        }

        $newRole = VendorUserRole::from($request->validated()['role']);

        // Check if removing the last owner
        if ($vendorUser->role === VendorUserRole::OWNER && $newRole !== VendorUserRole::OWNER) {
            $ownerCount = VendorUser::where('vendor_id', $vendor->id)
                ->where('role', VendorUserRole::OWNER)
                ->count();

            if ($ownerCount <= 1) {
                return response()->json([
                    'message' => 'Cannot change role of the sole owner of the store.',
                ], 422);
            }
        }

        $vendorUser->update(['role' => $newRole]);
        $vendorUser->load('user');

        return response()->json([
            'message' => 'Member role updated successfully',
            'data' => new VendorUserResource($vendorUser),
        ]);
    }

    #[OA\Delete(
        path: "/api/vendors/{vendor}/members/{user}",
        summary: "Remove a member from the vendor store",
        security: [["passport" => []]],
        tags: ["Vendor - Members"],
        parameters: [
            new OA\Parameter(
                name: "vendor",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
            new OA\Parameter(
                name: "user",
                in: "path",
                required: true,
                schema: new OA\Schema(type: "string")
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Member removed successfully",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                    ]
                )
            ),
        ]
    )]
    public function destroy(Request $request, Vendor $vendor, User $user): JsonResponse
    {
        $vendorUser = VendorUser::where('vendor_id', $vendor->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $vendorUser) {
            return response()->json([
                'message' => 'Member not found in this vendor store.',
            ], 404);
        }

        if ($vendorUser->role === VendorUserRole::OWNER) {
            $ownerCount = VendorUser::where('vendor_id', $vendor->id)
                ->where('role', VendorUserRole::OWNER)
                ->count();

            if ($ownerCount <= 1) {
                return response()->json([
                    'message' => 'Cannot remove the sole owner of the store.',
                ], 422);
            }
        }

        $vendorUser->delete();

        return response()->json([
            'message' => 'Member removed successfully from store',
        ]);
    }
}
