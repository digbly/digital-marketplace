<?php

namespace App\Enums;

enum VendorUserRole: string
{
    case OWNER = 'owner';
    case MANAGER = 'manager';
    case STAFF = 'staff';
}
