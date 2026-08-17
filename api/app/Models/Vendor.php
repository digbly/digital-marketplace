<?php

namespace App\Models;

use App\Enums\VendorStatus;
use App\Enums\VendorUserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
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

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        return $query->where('id', $value)->orWhere('slug', $value);
    }

    public function vendorUsers(): HasMany
    {
        return $this->hasMany(VendorUser::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'vendor_users')
            ->withPivot(['id', 'role'])
            ->withTimestamps();
    }

    public function isOwner(User $user): bool
    {
        return $this->vendorUsers()
            ->where('user_id', $user->id)
            ->where('role', VendorUserRole::OWNER)
            ->exists();
    }

    public function hasMember(User $user, ?VendorUserRole $role = null): bool
    {
        $query = $this->vendorUsers()->where('user_id', $user->id);

        if ($role !== null) {
            $query->where('role', $role);
        }

        return $query->exists();
    }

    public function getUserRole(User $user): ?VendorUserRole
    {
        $vendorUser = $this->vendorUsers()->where('user_id', $user->id)->first();

        return $vendorUser?->role;
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
