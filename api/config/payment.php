<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Gateway Driver
    |--------------------------------------------------------------------------
    */
    'default' => env('PAYMENT_DEFAULT_DRIVER', 'mock'),

    /*
    |--------------------------------------------------------------------------
    | Payment Gateways Configuration
    |--------------------------------------------------------------------------
    */
    'gateways' => [
        'mock' => [
            'driver' => 'mock',
            'auto_complete' => env('PAYMENT_MOCK_AUTO_COMPLETE', true),
        ],

        'stripe' => [
            'driver' => 'stripe',
            'key' => env('STRIPE_KEY', ''),
            'secret' => env('STRIPE_SECRET', ''),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
            'currency' => env('STRIPE_CURRENCY', 'usd'),
        ],

        'paypal' => [
            'driver' => 'paypal',
            'client_id' => env('PAYPAL_CLIENT_ID', ''),
            'client_secret' => env('PAYPAL_CLIENT_SECRET', ''),
            'webhook_id' => env('PAYPAL_WEBHOOK_ID', ''),
            'mode' => env('PAYPAL_MODE', 'sandbox'), // sandbox or live
        ],
    ],
];
