<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorWallet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'vendor_id',
        'balance',
        'holding_balance',
        'total_earned',
        'total_withdrawn',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'holding_balance' => 'decimal:2',
            'total_earned' => 'decimal:2',
            'total_withdrawn' => 'decimal:2',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class, 'wallet_id');
    }
}
