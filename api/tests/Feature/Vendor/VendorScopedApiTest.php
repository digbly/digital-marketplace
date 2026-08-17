<?php

namespace Tests\Feature\Vendor;

use App\Enums\VendorUserRole;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorUser;
use Database\Seeders\DigitalMarketplaceSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Passport\Passport;
use Tests\TestCase;

class VendorScopedApiTest extends TestCase
{
    use DatabaseMigrations;

    protected User $ownerUser;
    protected User $staffUser;
    protected User $nonMemberUser;
    protected Vendor $vendor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);

        $this->ownerUser = User::where('email', 'uiforge@marketplace.com')->firstOrFail();
        $this->nonMemberUser = User::where('email', 'buyer@marketplace.com')->firstOrFail();
        $this->vendor = Vendor::where('slug', 'uiforge-studio')->firstOrFail();

        $this->staffUser = User::factory()->create([
            'role' => 'vendor',
            'status' => 'active',
        ]);

        VendorUser::create([
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->staffUser->id,
            'role' => VendorUserRole::STAFF,
        ]);
    }

    public function test_staff_can_view_vendor_products(): void
    {
        Passport::actingAs($this->staffUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->id}/products");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'meta',
            ]);
    }

    public function test_non_member_cannot_access_vendor_products(): void
    {
        Passport::actingAs($this->nonMemberUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->id}/products");

        $response->assertStatus(403);
    }

    public function test_staff_cannot_access_wallet(): void
    {
        Passport::actingAs($this->staffUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->id}/wallet");

        $response->assertStatus(403);
    }

    public function test_owner_can_access_wallet(): void
    {
        Passport::actingAs($this->ownerUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->id}/wallet");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'balance',
                    'holding_balance',
                    'total_earned',
                    'currency',
                ],
            ]);
    }

    public function test_can_access_vendor_by_slug(): void
    {
        Passport::actingAs($this->ownerUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('data.store_name', $this->vendor->store_name);
    }
}
