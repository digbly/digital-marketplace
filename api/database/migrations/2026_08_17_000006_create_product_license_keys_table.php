<?php

use App\Enums\LicenseKeyStatus;
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
        Schema::create('product_license_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->uuid('order_item_id')->nullable()->index();
            $table->string('license_key')->unique();
            $table->string('status')->default(LicenseKeyStatus::AVAILABLE->value);
            $table->unsignedInteger('max_activations')->default(1);
            $table->unsignedInteger('activation_count')->default(0);
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_license_keys');
    }
};
