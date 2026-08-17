<?php

namespace App\Models;

use App\Enums\LicenseKeyStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductLicenseKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'order_item_id',
        'license_key',
        'status',
        'max_activations',
        'activation_count',
        'assigned_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => LicenseKeyStatus::class,
            'max_activations' => 'integer',
            'activation_count' => 'integer',
            'assigned_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
