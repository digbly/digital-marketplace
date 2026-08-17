<?php

namespace Modules\Payment\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Payment\Events\PaymentCompleted;
use Modules\Payment\Events\PaymentFailed;
use Modules\Payment\Events\PaymentRefunded;
use Modules\Payment\Models\Payment;
use Modules\Payment\Models\PaymentWebhook;
use Modules\Payment\Services\PaymentManager;
use OpenApi\Attributes as OA;

class PaymentWebhookController extends Controller
{
    public function __construct(
        protected PaymentManager $paymentManager
    ) {}

    #[OA\Post(
        path: "/api/v1/webhooks/payment/{gateway}",
        summary: "Universal webhook receiver for payment gateways",
        tags: ["Payment - Webhooks"],
        parameters: [
            new OA\Parameter(name: "gateway", in: "path", required: true, schema: new OA\Schema(type: "string", example: "stripe"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Webhook processed or already handled"),
            new OA\Response(response: 400, description: "Invalid signature or malformed payload"),
            new OA\Response(response: 404, description: "Associated payment not found"),
        ]
    )]
    public function handleWebhook(Request $request, string $gateway): JsonResponse
    {
        try {
            $driver = $this->paymentManager->driver($gateway);
        } catch (\Throwable $e) {
            Log::error("Unsupported payment gateway webhook: {$gateway}");
            return response()->json(['error' => "Gateway [{$gateway}] is not supported."], 400);
        }

        $webhookResult = $driver->verifyWebhook($request);

        if (!$webhookResult->isValid) {
            Log::warning("Invalid webhook signature for gateway {$gateway}: {$webhookResult->errorMessage}");
            return response()->json([
                'error' => $webhookResult->errorMessage ?? 'Invalid webhook signature.',
            ], 400);
        }

        // Idempotency check with database record
        $webhookRecord = PaymentWebhook::where('gateway', $gateway)
            ->where('event_id', $webhookResult->eventId)
            ->first();

        if ($webhookRecord && $webhookRecord->status === 'processed') {
            Log::info("Webhook {$gateway} event {$webhookResult->eventId} already processed.");
            return response()->json([
                'status' => 'already_processed',
                'message' => 'Event already processed idempotently.',
                'event_id' => $webhookResult->eventId,
            ], 200);
        }

        if (!$webhookRecord) {
            $webhookRecord = PaymentWebhook::create([
                'gateway' => $gateway,
                'event_id' => $webhookResult->eventId,
                'event_type' => $webhookResult->eventType,
                'payload' => $webhookResult->payload,
                'status' => 'processing',
            ]);
        }

        // Check if event type has status transition
        if ($webhookResult->status === null) {
            $webhookRecord->update([
                'status' => 'ignored',
                'processed_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => 'ignored',
                'event_id' => $webhookResult->eventId,
            ], 200);
        }

        // Find Payment record
        $payment = null;
        if ($webhookResult->orderId) {
            $payment = Payment::with('order')->find($webhookResult->orderId);
        }

        if (!$payment && $webhookResult->gatewayReference) {
            $payment = Payment::with('order')->where('gateway_reference', $webhookResult->gatewayReference)->first();
        }

        if (!$payment && $webhookResult->gatewayTransactionId) {
            $payment = Payment::with('order')->where('gateway_transaction_id', $webhookResult->gatewayTransactionId)->first();
        }

        if (!$payment) {
            $webhookRecord->update([
                'status' => 'failed',
                'error_message' => 'Payment record not found for webhook reference.',
                'processed_at' => Carbon::now(),
            ]);

            Log::error("Payment not found for webhook event {$webhookResult->eventId}");
            return response()->json(['error' => 'Associated payment record not found.'], 404);
        }

        $order = $payment->order;

        // Process status transitions & dispatch events
        DB::transaction(function () use ($payment, $order, $webhookResult, $webhookRecord) {
            $status = $webhookResult->status;

            if ($status === PaymentStatus::PAID) {
                $payment->update([
                    'status' => PaymentStatus::PAID,
                    'gateway_transaction_id' => $webhookResult->gatewayTransactionId ?? $payment->gateway_transaction_id,
                    'paid_at' => Carbon::now(),
                ]);

                event(new PaymentCompleted($payment, $order));
            } elseif ($status === PaymentStatus::REFUNDED) {
                $refundAmount = $webhookResult->amount ?? (float) $payment->amount;
                $payment->update([
                    'status' => PaymentStatus::REFUNDED,
                    'refunded_at' => Carbon::now(),
                ]);

                event(new PaymentRefunded($payment, $order, $refundAmount));
            } elseif ($status === PaymentStatus::FAILED) {
                $payment->update([
                    'status' => PaymentStatus::FAILED,
                    'error_message' => $webhookResult->errorMessage,
                ]);

                event(new PaymentFailed($payment, $order, $webhookResult->errorMessage));
            }

            $webhookRecord->update([
                'status' => 'processed',
                'processed_at' => Carbon::now(),
            ]);
        });

        return response()->json([
            'status' => 'success',
            'event_id' => $webhookResult->eventId,
            'payment_status' => $payment->fresh()->status->value,
        ], 200);
    }
}
