<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media as BaseMedia;

class Media extends BaseMedia
{
    use HasUuids;

    protected static function booted(): void
    {
        parent::booted();

        static::creating(function (Media $media) {
            if (empty($media->website_id) && $media->model) {
                if ($media->model instanceof Website) {
                    $media->website_id = $media->model->id;
                } elseif (isset($media->model->website_id)) {
                    $media->website_id = $media->model->website_id;
                }
            }
        });
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }
}
