<?php

namespace Tests\Unit\Models;

use App\Models\DynamicModel;
use App\Models\DynamicModelTranslation;
use App\Models\Website;
use App\Services\WebsiteDatabaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DynamicModelTest extends TestCase
{
    protected WebsiteDatabaseService $databaseService;
    protected string $connectionName = 'dynamic_model_test_conn';
    protected string $dbPath;

    protected function setUp(): void
    {
        parent::setUp();
        DynamicModel::clearRegisteredSchemas();
        Storage::fake('websites');
        $this->databaseService = new WebsiteDatabaseService();

        $this->dbPath = Storage::disk('websites')->path('test/dynamic_model_test.sqlite');

        $schemaConfig = [
            'categories' => [
                'label' => 'Categories',
                'translatable' => true,
                'timestamps' => true,
                'soft_deletes' => false,
                'columns' => [
                    'name' => [
                        'type' => 'string',
                        'translatable' => true,
                    ],
                    'slug' => [
                        'type' => 'slug',
                        'translatable' => true,
                    ],
                ],
            ],
            'tags' => [
                'label' => 'Tags',
                'translatable' => true,
                'timestamps' => true,
                'columns' => [
                    'name' => [
                        'type' => 'string',
                        'translatable' => true,
                    ],
                ],
            ],
            'blogs' => [
                'label' => 'Blogs',
                'translatable' => true,
                'timestamps' => true,
                'soft_deletes' => true,
                'columns' => [
                    'title' => [
                        'type' => 'string',
                        'translatable' => true,
                    ],
                    'slug' => [
                        'type' => 'slug',
                        'translatable' => true,
                    ],
                    'description' => [
                        'type' => 'text',
                        'translatable' => true,
                        'nullable' => true,
                    ],
                    'content' => [
                        'type' => 'longtext',
                        'translatable' => true,
                        'nullable' => true,
                    ],
                    'thumbnail' => [
                        'type' => 'media',
                        'translatable' => false,
                        'nullable' => true,
                    ],
                    'status' => [
                        'type' => 'enum',
                        'default' => 'draft',
                        'translatable' => false,
                        'nullable' => true,
                    ],
                    'views_count' => [
                        'type' => 'integer',
                        'default' => 0,
                        'translatable' => false,
                        'nullable' => true,
                    ],
                ],
                'relationships' => [
                    'category' => [
                        'type' => 'belongs_to',
                        'target' => 'categories',
                        'foreign_key' => 'category_id',
                    ],
                    'tags' => [
                        'type' => 'belongs_to_many',
                        'target' => 'tags',
                        'pivot_table' => 'blog_tag',
                    ],
                ],
            ],
        ];

        $this->databaseService->buildSchema($this->dbPath, $schemaConfig);

        config([
            "database.connections.{$this->connectionName}" => [
                'driver' => 'sqlite',
                'database' => $this->dbPath,
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);
    }

    protected function tearDown(): void
    {
        DB::disconnect($this->connectionName);
        DB::purge($this->connectionName);
        DynamicModel::clearRegisteredSchemas();
        parent::tearDown();
    }

    public function test_dynamic_model_stores_and_retrieves_translations(): void
    {
        $schema = DynamicModel::loadTemplateSchema('base', 'blogs') ?? [
            'translatable' => true,
            'timestamps' => true,
            'soft_deletes' => true,
            'columns' => [
                'title' => ['type' => 'string', 'translatable' => true],
                'slug' => ['type' => 'slug', 'translatable' => true],
                'description' => ['type' => 'text', 'translatable' => true, 'nullable' => true],
                'content' => ['type' => 'longtext', 'translatable' => true, 'nullable' => true],
                'thumbnail' => ['type' => 'media', 'translatable' => false, 'nullable' => true],
                'status' => ['type' => 'enum', 'translatable' => false, 'nullable' => true],
                'views_count' => ['type' => 'integer', 'translatable' => false, 'nullable' => true],
            ],
            'relationships' => [
                'category' => ['type' => 'belongs_to', 'target' => 'categories', 'foreign_key' => 'category_id'],
                'tags' => ['type' => 'belongs_to_many', 'target' => 'tags', 'pivot_table' => 'blog_tag'],
            ],
        ];

        $blog = DynamicModel::forTable('blogs', $schema, $this->connectionName);
        $blog->status = 'published';
        $blog->thumbnail = 'uploads/test.jpg';
        $blog->views_count = 150;

        // Translation in English
        $blog->translateOrNew('en')->title = 'Hello World';
        $blog->translateOrNew('en')->slug = 'hello-world';
        $blog->translateOrNew('en')->description = 'English short description';
        $blog->translateOrNew('en')->content = '<p>English content</p>';

        // Translation in Vietnamese
        $blog->translateOrNew('vi')->title = 'Xin chào thế giới';
        $blog->translateOrNew('vi')->slug = 'xin-chao-the-gioi';
        $blog->translateOrNew('vi')->description = 'Mô tả ngắn tiếng Việt';
        $blog->translateOrNew('vi')->content = '<p>Nội dung tiếng Việt</p>';

        $blog->save();

        $this->assertNotNull($blog->id);

        // Fetch fresh model
        $savedBlog = DynamicModel::forTable('blogs', $schema, $this->connectionName)->find($blog->id);
        $this->assertNotNull($savedBlog);
        $this->assertEquals('published', $savedBlog->status);
        $this->assertEquals('uploads/test.jpg', $savedBlog->thumbnail);
        $this->assertEquals(150, $savedBlog->views_count);

        // Test translations
        $this->assertEquals('Hello World', $savedBlog->translate('en')->title);
        $this->assertEquals('hello-world', $savedBlog->translate('en')->slug);
        $this->assertEquals('Xin chào thế giới', $savedBlog->translate('vi')->title);
        $this->assertEquals('xin-chao-the-gioi', $savedBlog->translate('vi')->slug);

        // Test translation queries
        $found = DynamicModel::forTable('blogs', $schema, $this->connectionName)
            ->whereTranslation('title', 'Xin chào thế giới')
            ->first();
        $this->assertNotNull($found);
        $this->assertEquals($blog->id, $found->id);

        $foundLike = DynamicModel::forTable('blogs', $schema, $this->connectionName)
            ->whereTranslationLike('title', '%Hello%')
            ->first();
        $this->assertNotNull($foundLike);
        $this->assertEquals($blog->id, $foundLike->id);
    }

    public function test_dynamic_relationships_belongs_to_and_belongs_to_many(): void
    {
        $categorySchema = [
            'translatable' => true,
            'columns' => [
                'name' => ['type' => 'string', 'translatable' => true],
                'slug' => ['type' => 'slug', 'translatable' => true],
            ],
        ];

        $category = DynamicModel::forTable('categories', $categorySchema, $this->connectionName);
        $category->translateOrNew('en')->name = 'Technology';
        $category->translateOrNew('en')->slug = 'technology';
        $category->save();

        $tagSchema = [
            'translatable' => true,
            'columns' => [
                'name' => ['type' => 'string', 'translatable' => true],
            ],
        ];

        $tag = DynamicModel::forTable('tags', $tagSchema, $this->connectionName);
        $tag->translateOrNew('en')->name = 'AI';
        $tag->save();

        $blogSchema = [
            'translatable' => true,
            'columns' => [
                'title' => ['type' => 'string', 'translatable' => true],
                'slug' => ['type' => 'slug', 'translatable' => true],
            ],
            'relationships' => [
                'category' => [
                    'type' => 'belongs_to',
                    'target' => 'categories',
                    'foreign_key' => 'category_id',
                ],
                'tags' => [
                    'type' => 'belongs_to_many',
                    'target' => 'tags',
                    'pivot_table' => 'blog_tag',
                ],
            ],
        ];

        $blog = DynamicModel::forTable('blogs', $blogSchema, $this->connectionName);
        $blog->category_id = $category->id;
        $blog->translateOrNew('en')->title = 'AI Revolution';
        $blog->translateOrNew('en')->slug = 'ai-revolution';
        $blog->save();

        // Attach tag
        $blog->tags()->attach($tag->id);

        // Fetch fresh blog and verify relations
        $freshBlog = DynamicModel::forTable('blogs', $blogSchema, $this->connectionName)->find($blog->id);
        $this->assertNotNull($freshBlog);

        $this->assertEquals($category->id, $freshBlog->category_id);
        $this->assertNotNull($freshBlog->category);
        $this->assertEquals($category->id, $freshBlog->category->id);
        $this->assertEquals('Technology', $freshBlog->category->translate('en')->name);

        $this->assertCount(1, $freshBlog->tags);
        $this->assertEquals($tag->id, $freshBlog->tags->first()->id);
        $this->assertEquals('AI', $freshBlog->tags->first()->translate('en')->name);
    }

    public function test_soft_deletes_when_enabled_in_schema(): void
    {
        $schema = [
            'translatable' => true,
            'soft_deletes' => true,
            'columns' => [
                'title' => ['type' => 'string', 'translatable' => true],
                'slug' => ['type' => 'slug', 'translatable' => true],
            ],
        ];

        $blog = DynamicModel::forTable('blogs', $schema, $this->connectionName);
        $blog->translateOrNew('en')->title = 'To be soft deleted';
        $blog->translateOrNew('en')->slug = 'to-be-soft-deleted';
        $blog->save();

        $blogId = $blog->id;
        $blog->delete();

        $this->assertNull(DynamicModel::forTable('blogs', $schema, $this->connectionName)->find($blogId));
        $this->assertNotNull(DynamicModel::forTable('blogs', $schema, $this->connectionName)->withTrashed()->find($blogId));
    }

    public function test_for_website_helper_binds_connection_and_loads_schema(): void
    {
        $website = new Website();
        $website->id = 'test-site-uuid-123';
        $website->db_path = 'test/dynamic_model_test.sqlite';
        $website->template = 'base';

        $blogModel = DynamicModel::forWebsite($website, 'blogs');
        $this->assertEquals('blogs', $blogModel->getTable());
        $this->assertEquals('tenant_test-site-uuid-123', $blogModel->getConnectionName());
        $this->assertContains('title', $blogModel->translatedAttributes);
        $this->assertContains('slug', $blogModel->translatedAttributes);

        $viaWebsite = $website->content('blogs');
        $this->assertEquals('blogs', $viaWebsite->getTable());
        $this->assertEquals('tenant_test-site-uuid-123', $viaWebsite->getConnectionName());
    }
}
