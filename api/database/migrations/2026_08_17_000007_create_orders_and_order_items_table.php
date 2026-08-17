<?php

use App\Enums\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUuid('buyer_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('subtotal_amount', 12, 2)->default(0.00);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('total_amount', 12, 2)->default(0.00);
            $table->string('payment_method')->default('platform_gateway');
            $table->string('payment_status')->default(PaymentStatus::PENDING->value);
            $table->string('transaction_id')->nullable();
            $table->string('customer_email')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('product_name');
            $table->string('product_type');
            $table->decimal('price', 12, 2);
            $table->decimal('commission_rate', 5, 2)->comment('Platform commission percentage');
            $table->decimal('commission_amount', 12, 2);
            $table->decimal('vendor_earning', 12, 2);
            $table->string('status')->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
