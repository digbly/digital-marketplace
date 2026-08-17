<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_id',
        'product_id',
        'vendor_id',
        'product_name',
        'product_type',
        'price',
        'commission_rate',
        'commission_amount',
        'vendor_earning',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'vendor_earning' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(OrderDownload::class);
    }

    public function licenseKey(): HasOne
    {
        return $this->hasOne(ProductLicenseKey::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
