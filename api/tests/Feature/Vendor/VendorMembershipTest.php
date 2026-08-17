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

class VendorMembershipTest extends TestCase
{
    use DatabaseMigrations;

    protected User $vendorUser;
    protected User $otherUser;
    protected Vendor $vendor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);

        $this->vendorUser = User::where('email', 'uiforge@marketplace.com')->firstOrFail();
        $this->otherUser = User::where('email', 'buyer@marketplace.com')->firstOrFail();
        $this->vendor = Vendor::where('slug', 'uiforge-studio')->firstOrFail();
    }

    public function test_user_can_list_their_vendors(): void
    {
        Passport::actingAs($this->vendorUser);

        $response = $this->getJson('/api/v1/vendors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'store_name', 'slug', 'status', 'current_user_role'],
                ],
            ]);

        $this->assertNotEmpty($response->json('data'));
    }

    public function test_user_can_create_new_vendor_and_becomes_owner(): void
    {
        Passport::actingAs($this->otherUser);

        $payload = [
            'store_name' => 'Brand New Studios',
            'slug' => 'brand-new-studios',
            'bio' => 'Awesome templates',
        ];

        $response = $this->postJson('/api/v1/vendors', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.store_name', 'Brand New Studios')
            ->assertJsonPath('data.slug', 'brand-new-studios');

        $vendorId = $response->json('data.id');

        $this->assertDatabaseHas('vendor_users', [
            'vendor_id' => $vendorId,
            'user_id' => $this->otherUser->id,
            'role' => VendorUserRole::OWNER->value,
        ]);
    }

    public function test_owner_can_add_member_to_vendor(): void
    {
        Passport::actingAs($this->vendorUser);

        $payload = [
            'email' => $this->otherUser->email,
            'role' => VendorUserRole::MANAGER->value,
        ];

        $response = $this->postJson("/api/v1/vendors/{$this->vendor->id}/members", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.user_id', $this->otherUser->id)
            ->assertJsonPath('data.role', VendorUserRole::MANAGER->value);

        $this->assertDatabaseHas('vendor_users', [
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->otherUser->id,
            'role' => VendorUserRole::MANAGER->value,
        ]);
    }

    public function test_cannot_add_duplicate_member(): void
    {
        Passport::actingAs($this->vendorUser);

        $payload = [
            'email' => $this->vendorUser->email,
            'role' => VendorUserRole::STAFF->value,
        ];

        $response = $this->postJson("/api/v1/vendors/{$this->vendor->id}/members", $payload);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'User is already a member of this vendor store.');
    }

    public function test_owner_can_update_member_role(): void
    {
        Passport::actingAs($this->vendorUser);

        // Add member first
        VendorUser::create([
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->otherUser->id,
            'role' => VendorUserRole::STAFF,
        ]);

        $response = $this->putJson("/api/v1/vendors/{$this->vendor->id}/members/{$this->otherUser->id}", [
            'role' => VendorUserRole::MANAGER->value,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', VendorUserRole::MANAGER->value);

        $this->assertDatabaseHas('vendor_users', [
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->otherUser->id,
            'role' => VendorUserRole::MANAGER->value,
        ]);
    }

    public function test_cannot_demote_sole_owner(): void
    {
        Passport::actingAs($this->vendorUser);

        $response = $this->putJson("/api/v1/vendors/{$this->vendor->id}/members/{$this->vendorUser->id}", [
            'role' => VendorUserRole::STAFF->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Cannot change role of the sole owner of the store.');
    }

    public function test_owner_can_remove_member(): void
    {
        Passport::actingAs($this->vendorUser);

        VendorUser::create([
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->otherUser->id,
            'role' => VendorUserRole::STAFF,
        ]);

        $response = $this->deleteJson("/api/v1/vendors/{$this->vendor->id}/members/{$this->otherUser->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Member removed successfully from store');

        $this->assertDatabaseMissing('vendor_users', [
            'vendor_id' => $this->vendor->id,
            'user_id' => $this->otherUser->id,
        ]);
    }

    public function test_cannot_remove_sole_owner(): void
    {
        Passport::actingAs($this->vendorUser);

        $response = $this->deleteJson("/api/v1/vendors/{$this->vendor->id}/members/{$this->vendorUser->id}");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Cannot remove the sole owner of the store.');
    }

    public function test_non_member_cannot_manage_members(): void
    {
        Passport::actingAs($this->otherUser);

        $response = $this->getJson("/api/v1/vendors/{$this->vendor->id}/members");

        $response->assertStatus(403);
    }
}
