<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductFile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'file_name',
        'original_name',
        'file_size',
        'mime_type',
        'storage_disk',
        'storage_path',
        'version',
        'is_main',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'is_main' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(OrderDownload::class);
    }
}
