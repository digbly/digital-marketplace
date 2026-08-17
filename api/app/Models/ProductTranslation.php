<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductTranslation extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'locale',
        'name',
        'short_description',
        'description',
        'changelog',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
