<?php

namespace App\Enums;

enum LicenseKeyStatus: string
{
    case AVAILABLE = 'available';
    case ASSIGNED = 'assigned';
    case REVOKED = 'revoked';
}
