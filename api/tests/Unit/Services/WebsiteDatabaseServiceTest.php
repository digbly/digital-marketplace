<?php

namespace Tests\Unit\Services;

use App\Models\Website;
use App\Services\WebsiteDatabaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebsiteDatabaseServiceTest extends TestCase
{
    protected WebsiteDatabaseService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('websites');
        $this->service = new WebsiteDatabaseService();
    }

    public function test_get_template_tables_json_path_resolves_base_template(): void
    {
        $path = $this->service->getTemplateTablesJsonPath('base');
        $this->assertNotNull($path);
        $this->assertFileExists($path);
        $this->assertStringContainsString('templates/base/systems/tables.json', $path);
    }

    public function test_get_template_tables_json_path_returns_null_for_non_existent(): void
    {
        $path = $this->service->getTemplateTablesJsonPath('non_existent_template_xyz');
        $this->assertNull($path);
    }

    public function test_build_schema_creates_tables_with_various_column_types(): void
    {
        $dbPath = Storage::disk('websites')->path('test/custom.sqlite');

        $schemaConfig = [
            'products' => [
                'label' => 'Products',
                'translatable' => false,
                'timestamps' => true,
                'soft_deletes' => true,
                'columns' => [
                    'name' => [
                        'type' => 'string',
                        'length' => 100,
                        'nullable' => false,
                        'unique' => true,
                    ],
                    'sku' => [
                        'type' => 'string',
                        'length' => 50,
                        'nullable' => false,
                    ],
                    'price' => [
                        'type' => 'decimal',
                        'precision' => 12,
                        'scale' => 2,
                        'default' => 0.00,
                    ],
                    'stock' => [
                        'type' => 'integer',
                        'default' => 0,
                    ],
                    'is_active' => [
                        'type' => 'boolean',
                        'default' => true,
                    ],
                    'specs' => [
                        'type' => 'json',
                        'nullable' => true,
                    ],
                    'published_at' => [
                        'type' => 'datetime',
                        'nullable' => true,
                    ],
                ],
                'relationships' => [
                    'brand' => [
                        'type' => 'belongs_to',
                        'foreign_key' => 'brand_id',
                    ],
                    'categories' => [
                        'type' => 'belongs_to_many',
                        'pivot_table' => 'category_product',
                    ],
                ],
            ],
        ];

        $this->service->buildSchema($dbPath, $schemaConfig);

        config([
            'database.connections.unit_tenant_test' => [
                'driver' => 'sqlite',
                'database' => $dbPath,
                'prefix' => '',
            ],
        ]);

        $schema = Schema::connection('unit_tenant_test');

        $this->assertTrue($schema->hasTable('products'));
        $this->assertTrue($schema->hasTable('category_product'));

        $this->assertTrue($schema->hasColumn('products', 'id'));
        $this->assertTrue($schema->hasColumn('products', 'name'));
        $this->assertTrue($schema->hasColumn('products', 'sku'));
        $this->assertTrue($schema->hasColumn('products', 'price'));
        $this->assertTrue($schema->hasColumn('products', 'stock'));
        $this->assertTrue($schema->hasColumn('products', 'is_active'));
        $this->assertTrue($schema->hasColumn('products', 'specs'));
        $this->assertTrue($schema->hasColumn('products', 'published_at'));
        $this->assertTrue($schema->hasColumn('products', 'brand_id'));
        $this->assertTrue($schema->hasColumn('products', 'created_at'));
        $this->assertTrue($schema->hasColumn('products', 'updated_at'));
        $this->assertTrue($schema->hasColumn('products', 'deleted_at'));

        $this->assertTrue($schema->hasColumn('category_product', 'id'));
        $this->assertTrue($schema->hasColumn('category_product', 'product_id'));
        $this->assertTrue($schema->hasColumn('category_product', 'category_id'));

        DB::disconnect('unit_tenant_test');
        DB::purge('unit_tenant_test');
    }

    public function test_create_database_for_website_with_empty_template(): void
    {
        $website = new Website();
        $website->db_path = '2026/08/16/test.sqlite';
        $website->template = null;

        $this->service->createDatabaseForWebsite($website);

        $fullPath = Storage::disk('websites')->path($website->db_path);
        $this->assertFileExists($fullPath);
    }
}
