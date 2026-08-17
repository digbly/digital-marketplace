<?php

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
        Schema::create('order_downloads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->foreignUuid('product_file_id')->constrained('product_files')->cascadeOnDelete();
            $table->string('download_token', 64)->unique();
            $table->unsignedInteger('download_count')->default(0);
            $table->unsignedInteger('max_downloads')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_downloaded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_downloads');
    }
};
