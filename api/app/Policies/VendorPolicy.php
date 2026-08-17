<?php

namespace App\Policies;

use App\Enums\VendorUserRole;
use App\Models\User;
use App\Models\Vendor;

class VendorPolicy
{
    public function view(User $user, Vendor $vendor): bool
    {
        return $vendor->hasMember($user);
    }

    public function update(User $user, Vendor $vendor): bool
    {
        return $vendor->hasMember($user, VendorUserRole::OWNER) ||
               $vendor->hasMember($user, VendorUserRole::MANAGER);
    }

    public function manageMembers(User $user, Vendor $vendor): bool
    {
        return $vendor->hasMember($user, VendorUserRole::OWNER) ||
               $vendor->hasMember($user, VendorUserRole::MANAGER);
    }

    public function manageProducts(User $user, Vendor $vendor): bool
    {
        return $vendor->hasMember($user);
    }

    public function manageOrders(User $user, Vendor $vendor): bool
    {
        return $vendor->hasMember($user);
    }

    public function manageWallet(User $user, Vendor $vendor): bool
    {
        return $vendor->isOwner($user);
    }

    public function delete(User $user, Vendor $vendor): bool
    {
        return $vendor->isOwner($user);
    }
}
