<?php

namespace App\Models;

use App\Enums\VendorUserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorUser extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'vendor_id',
        'user_id',
        'role',
    ];

    protected function casts(): array
    {
        return [
            'role' => VendorUserRole::class,
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
