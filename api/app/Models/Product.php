<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Enums\ProductType;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia, TranslatableContract
{
    use HasFactory, HasUuids, InteractsWithMedia, SoftDeletes, Translatable;

    public array $translatedAttributes = [
        'name',
        'short_description',
        'description',
        'changelog',
    ];

    protected $fillable = [
        'vendor_id',
        'category_id',
        'slug',
        'price',
        'sale_price',
        'product_type',
        'status',
        'thumbnail_url',
        'preview_images',
        'demo_url',
        'version',
        'download_limit',
        'expiry_days',
        'total_sales',
        'rating_avg',
        'rating_count',
        'is_featured',
        'attributes',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'product_type' => ProductType::class,
            'status' => ProductStatus::class,
            'preview_images' => 'array',
            'attributes' => 'array',
            'is_featured' => 'boolean',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'total_sales' => 'integer',
            'download_limit' => 'integer',
            'expiry_days' => 'integer',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ProductFile::class);
    }

    public function licenseKeys(): HasMany
    {
        return $this->hasMany(ProductLicenseKey::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) ($this->sale_price !== null && $this->sale_price < $this->price ? $this->sale_price : $this->price);
    }
}
