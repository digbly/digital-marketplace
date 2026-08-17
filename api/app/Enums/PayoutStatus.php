<?php

namespace App\Enums;

enum PayoutStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case PROCESSED = 'processed';
}
