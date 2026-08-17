<?php

namespace App\Enums;

enum ProductType: string
{
    case DOWNLOADABLE_FILE = 'downloadable_file';
    case LICENSE_KEY = 'license_key';
    case BUNDLE = 'bundle';
}
