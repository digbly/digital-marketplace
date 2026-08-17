<?php

namespace Modules\Payment\Listeners;

use App\Enums\PaymentStatus;
use App\Enums\WalletTransactionType;
use App\Models\OrderItem;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use App\Services\DigitalDeliveryService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Payment\Events\PaymentCompleted;

class FulfillOrderOnPaymentCompleted
{
    public function __construct(
        protected DigitalDeliveryService $deliveryService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(PaymentCompleted $event): void
    {
        $order = $event->order;
        $payment = $event->payment;

        DB::transaction(function () use ($order, $payment) {
            // Ensure order is marked as paid
            $order->update([
                'payment_status' => PaymentStatus::PAID,
                'paid_at' => $order->paid_at ?? Carbon::now(),
                'transaction_id' => $payment->gateway_transaction_id ?? $order->transaction_id,
            ]);

            // Ensure payment status is paid
            if ($payment->status !== PaymentStatus::PAID) {
                $payment->update([
                    'status' => PaymentStatus::PAID,
                    'paid_at' => $payment->paid_at ?? Carbon::now(),
                ]);
            }

            // Process order items
            $items = $order->items()->with(['product.vendor'])->get();

            foreach ($items as $item) {
                $product = $item->product;

                if ($product) {
                    $product->increment('total_sales');

                    // Credit Vendor Wallet
                    $wallet = VendorWallet::firstOrCreate(
                        ['vendor_id' => $product->vendor_id],
                        ['balance' => 0, 'holding_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
                    );

                    $balanceBefore = $wallet->balance;
                    $wallet->increment('balance', $item->vendor_earning);
                    $wallet->increment('total_earned', $item->vendor_earning);

                    WalletTransaction::create([
                        'wallet_id' => $wallet->id,
                        'type' => WalletTransactionType::ORDER_EARNING,
                        'amount' => $item->vendor_earning,
                        'balance_before' => $balanceBefore,
                        'balance_after' => $wallet->balance,
                        'reference_type' => OrderItem::class,
                        'reference_id' => $item->id,
                        'description' => "Earning for {$item->product_name} (Order #{$order->order_number})",
                    ]);
                }

                // Fulfill digital delivery
                $this->deliveryService->fulfillOrderItem($item);

                $item->update(['status' => 'completed']);
            }
        });

        Log::info("Order #{$order->order_number} fulfilled successfully via Payment #{$payment->id}.");
    }
}
