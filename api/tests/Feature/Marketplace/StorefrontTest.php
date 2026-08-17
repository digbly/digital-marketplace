<?php

namespace Tests\Feature\Marketplace;

use App\Models\Product;
use Database\Seeders\DigitalMarketplaceSeeder;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DigitalMarketplaceSeeder::class);
    }

    public function test_can_list_public_products(): void
    {
        $response = $this->getJson('/api/v1/storefront/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'price', 'product_type', 'status'],
                ],
            ]);
    }

    public function test_can_list_categories(): void
    {
        $response = $this->getJson('/api/v1/storefront/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug'],
                ],
            ]);
    }

    public function test_can_view_single_product(): void
    {
        $product = Product::query()->where('status', 'published')->first();

        $this->assertNotNull($product);

        $response = $this->getJson('/api/v1/storefront/products/' . $product->slug);

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', $product->name);
    }
}
