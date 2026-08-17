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
        Schema::create('product_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('original_name');
            $table->unsignedBigInteger('file_size')->comment('Size in bytes');
            $table->string('mime_type')->nullable();
            $table->string('storage_disk')->default('private');
            $table->string('storage_path');
            $table->string('version')->default('1.0.0');
            $table->boolean('is_main')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_files');
    }
};
