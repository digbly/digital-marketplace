<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProcessPayoutRequest;
use App\Http\Resources\PayoutRequestResource;
use App\Models\PayoutRequest;
use App\Services\PayoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AdminPayoutController extends Controller
{
    public function __construct(
        protected PayoutService $payoutService
    ) {}

    #[OA\Get(
        path: "/api/admin/payouts",
        summary: "List all vendor payout requests",
        security: [["passport" => []]],
        tags: ["Admin - Payouts"],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of payout requests",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(type: PayoutRequestResource::class)),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $payouts = PayoutRequest::with('vendor.vendorUsers.user')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => PayoutRequestResource::collection($payouts->items()),
            'meta' => [
                'current_page' => $payouts->currentPage(),
                'last_page' => $payouts->lastPage(),
                'total' => $payouts->total(),
            ],
        ]);
    }

    #[OA\Put(
        path: "/api/admin/payouts/{id}/process",
        summary: "Process or reject vendor payout request",
        security: [["passport" => []]],
        tags: ["Admin - Payouts"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\MediaType(
                    mediaType: "application/json",
                    schema: new OA\Schema(
                        type: ProcessPayoutRequest::class
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Payout processed",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: PayoutRequestResource::class),
                    ]
                )
            ),
        ]
    )]
    public function process(ProcessPayoutRequest $request, string $id): JsonResponse
    {
        $payout = PayoutRequest::findOrFail($id);
        $status = PayoutStatus::from($request->validated('status'));
        $note = $request->validated('admin_note');

        $payout = $this->payoutService->processPayout($payout, $status, $note);

        return response()->json([
            'message' => 'Payout request processed successfully',
            'data' => new PayoutRequestResource($payout),
        ]);
    }
}
