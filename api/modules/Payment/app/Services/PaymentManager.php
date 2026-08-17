<?php

namespace Modules\Payment\Services;

use Illuminate\Support\Manager;
use InvalidArgumentException;
use Modules\Payment\Contracts\PaymentGatewayInterface;
use Modules\Payment\Drivers\MockGatewayDriver;
use Modules\Payment\Drivers\PayPalGatewayDriver;
use Modules\Payment\Drivers\StripeGatewayDriver;

class PaymentManager extends Manager
{
    /**
     * Get the default driver name.
     */
    public function getDefaultDriver(): string
    {
        return $this->config->get('payment.default', 'mock');
    }

    /**
     * Get a driver instance by name.
     *
     * @param string|null $driver
     * @return PaymentGatewayInterface
     */
    public function driver($driver = null): PaymentGatewayInterface
    {
        $driver = $driver ?: $this->getDefaultDriver();

        /** @var PaymentGatewayInterface $gateway */
        $gateway = parent::driver($driver);

        return $gateway;
    }

    /**
     * Create the Mock payment gateway driver.
     */
    protected function createMockDriver(): PaymentGatewayInterface
    {
        $config = $this->config->get('payment.gateways.mock', []);
        return new MockGatewayDriver($config);
    }

    /**
     * Create the Stripe payment gateway driver.
     */
    protected function createStripeDriver(): PaymentGatewayInterface
    {
        $config = $this->config->get('payment.gateways.stripe', []);
        return new StripeGatewayDriver($config);
    }

    /**
     * Create the PayPal payment gateway driver.
     */
    protected function createPaypalDriver(): PaymentGatewayInterface
    {
        $config = $this->config->get('payment.gateways.paypal', []);
        return new PayPalGatewayDriver($config);
    }

    /**
     * Create custom gateway driver.
     */
    protected function createDriver($driver)
    {
        if (isset($this->customCreators[$driver])) {
            return $this->callCustomCreator($driver);
        }

        $method = 'create' . str_replace('_', '', ucwords($driver, '_')) . 'Driver';

        if (method_exists($this, $method)) {
            return $this->$method();
        }

        throw new InvalidArgumentException("Payment driver [{$driver}] is not supported.");
    }
}
