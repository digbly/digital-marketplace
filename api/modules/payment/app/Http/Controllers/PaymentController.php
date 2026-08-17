<?php

namespace Modules\Payment\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Payment\Events\PaymentCompleted;
use Modules\Payment\Http\Resources\PaymentResource;
use Modules\Payment\Models\Payment;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    #[OA\Get(
        path: "/api/v1/payments/{id}/status",
        summary: "Get payment transaction status",
        tags: ["Payment - Status"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string", format: "uuid"))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Payment status detail",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: PaymentResource::class),
                    ]
                )
            ),
            new OA\Response(response: 404, description: "Payment not found"),
        ]
    )]
    public function status(string $id): JsonResponse
    {
        $payment = Payment::with('order.items')->findOrFail($id);

        return response()->json([
            'data' => new PaymentResource($payment),
            'order_status' => $payment->order->payment_status->value,
        ]);
    }

    /**
     * Simulated mock return endpoint for local/sandbox development.
     */
    public function mockReturn(Request $request, string $payment_id): JsonResponse
    {
        $payment = Payment::with('order')->findOrFail($payment_id);

        if ($payment->status !== PaymentStatus::PAID) {
            $payment->update([
                'status' => PaymentStatus::PAID,
                'paid_at' => now(),
            ]);

            event(new PaymentCompleted($payment, $payment->order));
        }

        return response()->json([
            'message' => 'Mock payment settled successfully.',
            'payment' => new PaymentResource($payment),
        ]);
    }
}
