<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Payment\Events\PaymentCompleted;
use Modules\Payment\Models\Payment;
use Modules\Payment\Services\PaymentManager;

class OrderService
{
    public function __construct(
        protected PaymentManager $paymentManager
    ) {}

    /**
     * Create checkout order and initialize payment session.
     */
    public function createOrder(User $buyer, array $itemsData, string $paymentMethod): array
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
                'payment_status' => PaymentStatus::PENDING,
                'customer_email' => $buyer->email,
            ]);

            foreach ($itemsData as $itemData) {
                $product = Product::with('vendor')->findOrFail($itemData['product_id']);
                $price = $product->effective_price;
                $subtotal += $price;

                $commissionRate = $product->vendor->commission_rate ?? 15.00;
                $commissionAmount = round(($price * $commissionRate) / 100, 2);
                $vendorEarning = round($price - $commissionAmount, 2);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'product_name' => $product->name,
                    'product_type' => $product->product_type->value,
                    'price' => $price,
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commissionAmount,
                    'vendor_earning' => $vendorEarning,
                    'status' => 'pending',
                ]);
            }

            $order->update([
                'subtotal_amount' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            // Create decoupled Payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'user_id' => $buyer->id,
                'payment_method' => $paymentMethod,
                'amount' => $subtotal,
                'currency' => 'USD',
                'status' => PaymentStatus::PENDING,
            ]);

            // Initiate payment via Gateway Driver
            $driver = $this->paymentManager->driver($paymentMethod);
            $initResponse = $driver->initiatePayment($payment);

            // If mock driver and auto-complete is enabled, dispatch completion event immediately
            if ($paymentMethod === 'mock' && config('payment.gateways.mock.auto_complete', true)) {
                $payment->update([
                    'status' => PaymentStatus::PAID,
                    'paid_at' => now(),
                ]);

                event(new PaymentCompleted($payment, $order));
            }

            return [
                'order' => $order->fresh(['items.product', 'items.downloads', 'items.licenseKey']),
                'payment' => $payment->fresh(),
                'init_response' => $initResponse,
            ];
        });
    }
}
