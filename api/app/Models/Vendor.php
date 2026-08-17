<?php

namespace App\Models;

use App\Enums\VendorStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'store_name',
        'slug',
        'bio',
        'logo_url',
        'banner_url',
        'commission_rate',
        'status',
        'payout_details',
    ];

    protected function casts(): array
    {
        return [
            'status' => VendorStatus::class,
            'commission_rate' => 'decimal:2',
            'payout_details' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(VendorWallet::class);
    }

    public function payoutRequests(): HasMany
    {
        return $this->hasMany(PayoutRequest::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
