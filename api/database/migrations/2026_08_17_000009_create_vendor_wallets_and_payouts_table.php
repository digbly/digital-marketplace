<?php

use App\Enums\PayoutStatus;
use App\Enums\WalletTransactionType;
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
        Schema::create('vendor_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->decimal('balance', 12, 2)->default(0.00)->comment('Available balance ready for payout');
            $table->decimal('holding_balance', 12, 2)->default(0.00)->comment('Escrow / pending balance awaiting clearance');
            $table->decimal('total_earned', 12, 2)->default(0.00);
            $table->decimal('total_withdrawn', 12, 2)->default(0.00);
            $table->string('currency', 3)->default('USD');
            $table->timestamps();
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('wallet_id')->constrained('vendor_wallets')->cascadeOnDelete();
            $table->string('type')->default(WalletTransactionType::ORDER_EARNING->value);
            $table->decimal('amount', 12, 2);
            $table->decimal('balance_before', 12, 2);
            $table->decimal('balance_after', 12, 2);
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable()->index();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('payout_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('payout_method')->default('bank_transfer');
            $table->json('payout_account_details');
            $table->string('status')->default(PayoutStatus::PENDING->value);
            $table->text('admin_note')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('vendor_wallets');
    }
};
