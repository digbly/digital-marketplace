<?php

namespace Tests\Unit\Models;

use App\Enums\WebsiteStatus;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebsiteMediaTest extends TestCase
{
    use RefreshDatabase;

    public function test_website_supports_media_upload_and_retrieval(): void
    {
        Storage::fake('public');
        config(['media-library.disk_name' => 'public']);

        $website = Website::create([
            'title' => 'Test Site',
            'subdomain' => 'test-site',
            'status' => WebsiteStatus::ACTIVE,
        ]);

        $file = UploadedFile::fake()->image('logo.png', 200, 200);

        $media = $website->addMedia($file)
            ->toMediaCollection('logo');

        $this->assertNotNull($media);
        $this->assertIsString($media->id);
        $this->assertSame(36, strlen($media->id));
        $this->assertSame($website->id, $media->website_id);
        $this->assertSame('logo', $media->collection_name);
        $this->assertSame($website->id, $media->model_id);
        $this->assertCount(1, $website->getMedia('logo'));
        $this->assertSame($media->id, $website->getFirstMedia('logo')?->id);
        $this->assertCount(1, $website->websiteMedia);
        $this->assertSame($media->id, $website->websiteMedia->first()?->id);
        $this->assertSame($website->id, $media->website?->id);
    }
}
