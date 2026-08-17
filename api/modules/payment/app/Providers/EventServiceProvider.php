<?php

namespace Modules\Payment\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Modules\Payment\Events\PaymentCompleted;
use Modules\Payment\Events\PaymentFailed;
use Modules\Payment\Events\PaymentRefunded;
use Modules\Payment\Listeners\FulfillOrderOnPaymentCompleted;
use Modules\Payment\Listeners\HandleOrderPaymentFailed;
use Modules\Payment\Listeners\RevokeOrderOnPaymentRefunded;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event handler mappings for the application.
     *
     * @var array<string, array<int, string>>
     */
    protected $listen = [
        PaymentCompleted::class => [
            FulfillOrderOnPaymentCompleted::class,
        ],
        PaymentRefunded::class => [
            RevokeOrderOnPaymentRefunded::class,
        ],
        PaymentFailed::class => [
            HandleOrderPaymentFailed::class,
        ],
    ];

    /**
     * Indicates if events should be discovered.
     *
     * @var bool
     */
    protected static $shouldDiscoverEvents = false;

    /**
     * Configure the proper event listeners for email verification.
     */
    protected function configureEmailVerification(): void {}
}
