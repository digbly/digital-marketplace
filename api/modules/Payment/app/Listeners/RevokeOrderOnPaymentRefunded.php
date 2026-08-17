<?php

namespace Modules\Payment\Listeners;

use App\Enums\LicenseKeyStatus;
use App\Enums\PaymentStatus;
use App\Enums\WalletTransactionType;
use App\Models\OrderDownload;
use App\Models\OrderItem;
use App\Models\ProductLicenseKey;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Modules\Payment\Events\PaymentRefunded;

class RevokeOrderOnPaymentRefunded
{
    /**
     * Handle the event.
     */
    public function handle(PaymentRefunded $event): void
    {
        $order = $event->order;
        $payment = $event->payment;

        DB::transaction(function () use ($order, $payment) {
            $order->update([
                'payment_status' => PaymentStatus::REFUNDED,
            ]);

            $payment->update([
                'status' => PaymentStatus::REFUNDED,
                'refunded_at' => $payment->refunded_at ?? Carbon::now(),
            ]);

            $items = $order->items()->with(['product'])->get();

            foreach ($items as $item) {
                // 1. Revoke / Expire all download tokens
                OrderDownload::where('order_item_id', $item->id)->update([
                    'expires_at' => Carbon::now()->subMinute(),
                ]);

                // 2. Deactivate assigned license keys
                ProductLicenseKey::where('order_item_id', $item->id)->update([
                    'status' => LicenseKeyStatus::REVOKED,
                ]);

                // 3. Reverse Vendor Wallet Earning if product vendor exists
                if ($item->product && $item->vendor_id) {
                    $wallet = VendorWallet::where('vendor_id', $item->vendor_id)->first();
                    if ($wallet) {
                        $balanceBefore = $wallet->balance;
                        $deduction = min($wallet->balance, $item->vendor_earning);
                        $wallet->decrement('balance', $deduction);

                        WalletTransaction::create([
                            'wallet_id' => $wallet->id,
                            'type' => WalletTransactionType::REFUND_DEDUCTION,
                            'amount' => -$deduction,
                            'balance_before' => $balanceBefore,
                            'balance_after' => $wallet->balance,
                            'reference_type' => OrderItem::class,
                            'reference_id' => $item->id,
                            'description' => "Refund deduction for {$item->product_name} (Order #{$order->order_number})",
                        ]);
                    }
                }

                $item->update(['status' => 'refunded']);
            }
        });

        Log::warning("Order #{$order->order_number} refunded and access revoked via Payment #{$payment->id}.");
    }
}
