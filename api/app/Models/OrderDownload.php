<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDownload extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'order_item_id',
        'product_file_id',
        'download_token',
        'download_count',
        'max_downloads',
        'expires_at',
        'last_downloaded_at',
    ];

    protected function casts(): array
    {
        return [
            'download_count' => 'integer',
            'max_downloads' => 'integer',
            'expires_at' => 'datetime',
            'last_downloaded_at' => 'datetime',
        ];
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function productFile(): BelongsTo
    {
        return $this->belongsTo(ProductFile::class);
    }

    public function isExpired(): bool
    {
        if ($this->expires_at && $this->expires_at->isPast()) {
            return true;
        }

        if ($this->max_downloads && $this->download_count >= $this->max_downloads) {
            return true;
        }

        return false;
    }
}
