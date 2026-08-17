<?php

namespace Tests\Feature\Admin;

use App\Models\PayoutRequest;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Database\Seeders\DigitalMarketplaceSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Passport\Passport;
use Tests\TestCase;

class AdminControllerTest extends TestCase
{
    use DatabaseMigrations;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);

        $this->adminUser = User::query()->where('role', 'admin')->first()
            ?? User::factory()->create(['role' => 'admin']);

        Passport::actingAs($this->adminUser);
    }

    public function test_admin_can_view_platform_analytics(): void
    {
        $response = $this->getJson('/api/v1/admin/analytics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_revenue',
                    'total_commission',
                    'total_orders',
                    'total_products',
                    'total_vendors',
                    'total_buyers',
                    'recent_orders',
                ],
            ]);
    }

    public function test_admin_can_list_and_moderate_vendors(): void
    {
        $vendor = Vendor::query()->first();
        $this->assertNotNull($vendor);

        $response = $this->getJson('/api/v1/admin/vendors');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'store_name', 'status'],
                ],
            ]);

        $updateResponse = $this->putJson('/api/v1/admin/vendors/' . $vendor->id . '/status', [
            'status' => 'approved',
            'commission_rate' => 12.5,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('vendors', [
            'id' => $vendor->id,
            'status' => 'approved',
            'commission_rate' => 12.5,
        ]);
    }

    public function test_admin_can_list_and_moderate_products(): void
    {
        $product = Product::query()->first();
        $this->assertNotNull($product);

        $response = $this->getJson('/api/v1/admin/products');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'status', 'is_featured'],
                ],
            ]);

        $moderateResponse = $this->putJson('/api/v1/admin/products/' . $product->id . '/moderate', [
            'status' => 'published',
            'is_featured' => true,
        ]);

        $moderateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.is_featured', true);
    }

    public function test_admin_can_list_and_process_payouts(): void
    {
        $payout = PayoutRequest::query()->first();
        if (!$payout) {
            $vendor = Vendor::query()->first();
            $payout = PayoutRequest::create([
                'vendor_id' => $vendor->id,
                'amount' => 50.00,
                'payout_method' => 'bank_transfer',
                'payout_account_details' => ['iban' => 'US123456789'],
                'status' => 'pending',
            ]);
        }

        $response = $this->getJson('/api/v1/admin/payouts');
        $response->assertStatus(200);

        $processResponse = $this->putJson('/api/v1/admin/payouts/' . $payout->id . '/process', [
            'status' => 'processed',
            'admin_note' => 'Paid via ACH transfer',
        ]);

        $processResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'processed');
    }
}
