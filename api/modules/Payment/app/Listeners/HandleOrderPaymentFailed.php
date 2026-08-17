<?php

namespace Modules\Payment\Listeners;

use App\Enums\PaymentStatus;
use Illuminate\Support\Facades\Log;
use Modules\Payment\Events\PaymentFailed;

class HandleOrderPaymentFailed
{
    /**
     * Handle the event.
     */
    public function handle(PaymentFailed $event): void
    {
        $order = $event->order;
        $payment = $event->payment;

        $order->update([
            'payment_status' => PaymentStatus::FAILED,
        ]);

        $payment->update([
            'status' => PaymentStatus::FAILED,
            'error_message' => $event->reason,
        ]);

        $order->items()->update(['status' => 'failed']);

        Log::warning("Order #{$order->order_number} payment failed: {$event->reason}");
    }
}
