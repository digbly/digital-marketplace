<?php

namespace App\Services;

use App\Enums\LicenseKeyStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\OrderDownload;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\ProductLicenseKey;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DigitalDeliveryService
{
    /**
     * Fulfill digital assets for a paid order item.
     */
    public function fulfillOrderItem(OrderItem $item): void
    {
        $product = $item->product;

        if (!$product) {
            return;
        }

        // Fulfill Downloadable Files
        if (in_array($product->product_type, [ProductType::DOWNLOADABLE_FILE, ProductType::BUNDLE])) {
            $files = $product->files()->where('is_main', true)->get();
            if ($files->isEmpty()) {
                $files = $product->files()->get();
            }

            foreach ($files as $file) {
                OrderDownload::firstOrCreate(
                    [
                        'order_item_id' => $item->id,
                        'product_file_id' => $file->id,
                    ],
                    [
                        'download_token' => Str::random(48),
                        'download_count' => 0,
                        'max_downloads' => $product->download_limit,
                        'expires_at' => $product->expiry_days ? Carbon::now()->addDays($product->expiry_days) : null,
                    ]
                );
            }
        }

        // Fulfill License Key
        if (in_array($product->product_type, [ProductType::LICENSE_KEY, ProductType::BUNDLE])) {
            // Find available key or generate
            $licenseKey = ProductLicenseKey::where('product_id', $product->id)
                ->where('status', LicenseKeyStatus::AVAILABLE)
                ->lockForUpdate()
                ->first();

            if ($licenseKey) {
                $licenseKey->update([
                    'order_item_id' => $item->id,
                    'status' => LicenseKeyStatus::ASSIGNED,
                    'assigned_at' => Carbon::now(),
                ]);
            } else {
                // Auto-generate key if pool is empty
                ProductLicenseKey::create([
                    'product_id' => $product->id,
                    'order_item_id' => $item->id,
                    'license_key' => strtoupper(Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4)),
                    'status' => LicenseKeyStatus::ASSIGNED,
                    'max_activations' => 1,
                    'activation_count' => 0,
                    'assigned_at' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * Download secure file by token.
     */
    public function downloadFile(string $token): StreamedResponse
    {
        $orderDownload = OrderDownload::with('productFile')->where('download_token', $token)->firstOrFail();

        if ($orderDownload->isExpired()) {
            abort(403, 'Download link has expired or reached the maximum download limit.');
        }

        $file = $orderDownload->productFile;
        if (!$file || !Storage::disk($file->storage_disk)->exists($file->storage_path)) {
            abort(404, 'File not found on storage.');
        }

        $orderDownload->increment('download_count');
        $orderDownload->update(['last_downloaded_at' => Carbon::now()]);

        return Storage::disk($file->storage_disk)->download(
            $file->storage_path,
            $file->original_name
        );
    }

    /**
     * Generate a structured license key string.
     */
    public function generateLicenseKey(string $prefix = 'KEY'): string
    {
        return strtoupper($prefix . '-' . Str::random(4) . '-' . Str::random(4) . '-' . Str::random(4));
    }
}
