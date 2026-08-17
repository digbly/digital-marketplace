<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\CreatePayoutRequest;
use App\Http\Resources\PayoutRequestResource;
use App\Http\Resources\VendorWalletResource;
use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class VendorWalletController extends Controller
{
    public function __construct(
        protected PayoutService $payoutService
    ) {}

    #[OA\Get(
        path: "/api/vendor/wallet",
        summary: "Get vendor wallet overview and recent transactions",
        security: [["passport" => []]],
        tags: ["Vendor - Wallet"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Vendor wallet details",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: VendorWalletResource::class),
                    ]
                )
            ),
        ]
    )]
    public function index(): JsonResponse
    {
        $vendor = Vendor::where('user_id', Auth::id())->firstOrFail();
        $wallet = VendorWallet::with(['transactions' => function ($q) {
            $q->latest()->limit(50);
        }])->firstOrCreate(['vendor_id' => $vendor->id]);

        return response()->json([
            'data' => new VendorWalletResource($wallet),
        ]);
    }

    #[OA\Post(
        path: "/api/vendor/payouts",
        summary: "Submit payout withdrawal request",
        security: [["passport" => []]],
        tags: ["Vendor - Wallet"],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: CreatePayoutRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Payout request submitted",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string"),
                        new OA\Property(property: "data", type: PayoutRequestResource::class),
                    ]
                )
            ),
        ]
    )]
    public function requestPayout(CreatePayoutRequest $request): JsonResponse
    {
        $vendor = Vendor::where('user_id', Auth::id())->firstOrFail();

        $payout = $this->payoutService->requestPayout(
            $vendor,
            $request->validated('amount'),
            $request->validated('payout_method'),
            $request->validated('payout_account_details')
        );

        return response()->json([
            'message' => 'Payout request submitted successfully. Admin will review and process.',
            'data' => new PayoutRequestResource($payout),
        ], 201);
    }
}
