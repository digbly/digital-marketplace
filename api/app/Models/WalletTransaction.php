<?php

namespace App\Models;

use App\Enums\WalletTransactionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'reference_type',
        'reference_id',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'type' => WalletTransactionType::class,
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(VendorWallet::class, 'wallet_id');
    }
}
