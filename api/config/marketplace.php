<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Platform Commission Rate (%)
    |--------------------------------------------------------------------------
    |
    | The default marketplace commission fee percentage deducted from each order
    | if a vendor does not have a custom commission rate specified.
    |
    */
    'default_commission_rate' => (float) env('MARKETPLACE_DEFAULT_COMMISSION_RATE', 15.00),

    /*
    |--------------------------------------------------------------------------
    | Escrow Holding Duration (Days)
    |--------------------------------------------------------------------------
    |
    | Number of days vendor revenue is held in escrow before transitioning
    | to available balance for payout withdrawal.
    |
    */
    'escrow_holding_days' => (int) env('MARKETPLACE_ESCROW_HOLDING_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Minimum Payout Threshold ($)
    |--------------------------------------------------------------------------
    |
    | Minimum wallet balance required before a vendor can request a payout.
    |
    */
    'min_payout_amount' => (float) env('MARKETPLACE_MIN_PAYOUT_AMOUNT', 50.00),

    /*
    |--------------------------------------------------------------------------
    | Platform Currency
    |--------------------------------------------------------------------------
    |
    | Default currency code for marketplace transactions and display.
    |
    */
    'currency' => env('MARKETPLACE_CURRENCY', 'USD'),
];
