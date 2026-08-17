<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\WalletTransactionType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected DigitalDeliveryService $deliveryService
    ) {}

    /**
     * Create and process checkout order.
     */
    public function createOrder(User $buyer, array $itemsData, string $paymentMethod): Order
    {
        return DB::transaction(function () use ($buyer, $itemsData, $paymentMethod) {
            $subtotal = 0.00;
            $orderNumber = 'ORD-' . strtoupper(Str::random(10));

            $order = Order::create([
                'order_number' => $orderNumber,
                'buyer_id' => $buyer->id,
                'subtotal_amount' => 0.00,
                'discount_amount' => 0.00,
                'total_amount' => 0.00,
                'payment_method' => $paymentMethod,
                'payment_status' => PaymentStatus::PAID, // Simulated instant platform payment
                'transaction_id' => 'TXN-' . strtoupper(Str::random(12)),
                'customer_email' => $buyer->email,
                'paid_at' => Carbon::now(),
            ]);

            foreach ($itemsData as $itemData) {
                $product = Product::with('vendor')->findOrFail($itemData['product_id']);
                $price = $product->effective_price;
                $subtotal += $price;

                // Commission rate: vendor specific or default 15%
                $commissionRate = $product->vendor->commission_rate ?? 15.00;
                $commissionAmount = round(($price * $commissionRate) / 100, 2);
                $vendorEarning = round($price - $commissionAmount, 2);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'product_name' => $product->name,
                    'product_type' => $product->product_type->value,
                    'price' => $price,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'vendor_earning' => $vendorEarning,
                    'status' => 'completed',
                ]);

                // Update product stats
                $product->increment('total_sales');

                // Credit Vendor Wallet (into available balance or holding escrow)
                $wallet = VendorWallet::firstOrCreate(
                    ['vendor_id' => $product->vendor_id],
                    ['balance' => 0, 'holding_balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0]
                );

                $balanceBefore = $wallet->balance;
                $wallet->increment('balance', $vendorEarning);
                $wallet->increment('total_earned', $vendorEarning);

                WalletTransaction::create([
                    'wallet_id' => $wallet->id,
                    'type' => WalletTransactionType::ORDER_EARNING,
                    'amount' => $vendorEarning,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $wallet->balance,
                    'reference_type' => OrderItem::class,
                    'reference_id' => $orderItem->id,
                    'description' => "Earning for {$product->name} (Order #{$order->order_number})",
                ]);

                // Fulfill digital delivery
                $this->deliveryService->fulfillOrderItem($orderItem);
            }

            $order->update([
                'subtotal_amount' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            return $order->load(['items.product', 'items.downloads', 'items.licenseKey']);
        });
    }
}
