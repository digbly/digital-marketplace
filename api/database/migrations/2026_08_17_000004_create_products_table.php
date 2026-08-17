<?php

use App\Enums\ProductStatus;
use App\Enums\ProductType;
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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('slug')->unique();
            $table->decimal('price', 12, 2)->default(0.00);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->string('product_type')->default(ProductType::DOWNLOADABLE_FILE->value);
            $table->string('status')->default(ProductStatus::DRAFT->value);
            $table->string('thumbnail_url')->nullable();
            $table->json('preview_images')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('version')->default('1.0.0');
            $table->integer('download_limit')->nullable()->comment('Max allowed downloads per purchase. Null for unlimited');
            $table->integer('expiry_days')->nullable()->comment('Days until download expires. Null for lifetime');
            $table->unsignedBigInteger('total_sales')->default(0);
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->unsignedInteger('rating_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->json('attributes')->nullable()->comment('Tech specs, format, compatible software, etc.');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('locale')->index();
            $table->string('name');
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('changelog')->nullable();

            $table->unique(['product_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_translations');
        Schema::dropIfExists('products');
    }
};
