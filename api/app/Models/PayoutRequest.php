<?php

namespace App\Models;

use App\Enums\PayoutStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayoutRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'vendor_id',
        'amount',
        'payout_method',
        'payout_account_details',
        'status',
        'admin_note',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PayoutStatus::class,
            'payout_account_details' => 'array',
            'processed_at' => 'datetime',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
