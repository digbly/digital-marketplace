<?php

namespace Tests\Feature\Marketplace;

use App\Enums\PayoutStatus;
use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Services\DigitalDeliveryService;
use App\Services\PayoutService;
use Database\Seeders\DigitalMarketplaceSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class DigitalDeliveryTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);
    }

    public function test_can_generate_license_keys(): void
    {
        $deliveryService = app(DigitalDeliveryService::class);
        $key = $deliveryService->generateLicenseKey('PRO');

        $this->assertNotNull($key);
        $this->assertStringStartsWith('PRO-', $key);
    }

    public function test_payout_service_deducts_and_processes(): void
    {
        $payoutService = app(PayoutService::class);

        $vendor = Vendor::query()->first();
        $this->assertNotNull($vendor);

        $wallet = $vendor->wallet;
        $initialBalance = $wallet->balance;

        // Request Payout
        $payout = $payoutService->requestPayout($vendor, 100.00, 'bank_transfer', ['bank' => 'Test Bank']);
        $this->assertEquals(PayoutStatus::PENDING, $payout->status);

        $wallet->refresh();
        $this->assertEquals($initialBalance - 100.00, $wallet->balance);

        // Admin Process
        $processed = $payoutService->processPayout($payout, PayoutStatus::PROCESSED, 'Sent via wire');
        $this->assertEquals(PayoutStatus::PROCESSED, $processed->status);
    }
}
