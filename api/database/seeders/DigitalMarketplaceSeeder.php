<?php

namespace Database\Seeders;

use App\Enums\LicenseKeyStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Enums\WalletTransactionType;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderDownload;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductFile;
use App\Models\ProductLicenseKey;
use App\Models\Review;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorWallet;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DigitalMarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@marketplace.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::ADMIN,
                'status' => 'active',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $vendorUser1 = User::firstOrCreate(
            ['email' => 'uiforge@marketplace.com'],
            [
                'name' => 'Alex Rivera',
                'password' => Hash::make('password'),
                'role' => UserRole::VENDOR,
                'status' => 'active',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $vendorUser2 = User::firstOrCreate(
            ['email' => 'codecraft@marketplace.com'],
            [
                'name' => 'Elena Rostova',
                'password' => Hash::make('password'),
                'role' => UserRole::VENDOR,
                'status' => 'active',
                'email_verified_at' => Carbon::now(),
            ]
        );

        $buyer = User::firstOrCreate(
            ['email' => 'buyer@marketplace.com'],
            [
                'name' => 'David Nguyen',
                'password' => Hash::make('password'),
                'role' => UserRole::CUSTOMER,
                'status' => 'active',
                'email_verified_at' => Carbon::now(),
            ]
        );

        // 2. Create Vendors
        $vendor1 = Vendor::firstOrCreate(
            ['user_id' => $vendorUser1->id],
            [
                'store_name' => 'UIForge Studio',
                'slug' => 'uiforge-studio',
                'bio' => 'Crafting ultra-modern UI kits, design systems, and frontend templates for modern creators.',
                'logo_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                'banner_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
                'commission_rate' => 12.50,
                'status' => VendorStatus::APPROVED,
                'payout_details' => ['bank_name' => 'Chase Bank', 'account_number' => '•••• 8821', 'account_holder' => 'Alex Rivera'],
            ]
        );

        $vendor2 = Vendor::firstOrCreate(
            ['user_id' => $vendorUser2->id],
            [
                'store_name' => 'CodeCraft Labs',
                'slug' => 'codecraft-labs',
                'bio' => 'Production-ready SaaS boilerplates, API software tools, and full-stack backend solutions.',
                'logo_url' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150',
                'banner_url' => 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
                'commission_rate' => 15.00,
                'status' => VendorStatus::APPROVED,
                'payout_details' => ['paypal_email' => 'elena@codecraftlabs.io'],
            ]
        );

        // 3. Create Categories
        $categoriesData = [
            [
                'slug' => 'templates-themes',
                'icon' => 'Layout',
                'color' => '#3b82f6',
                'en' => ['name' => 'Templates & Themes', 'description' => 'Website templates, admin dashboards and landing pages.'],
            ],
            [
                'slug' => 'ui-kits-design',
                'icon' => 'Figma',
                'color' => '#8b5cf6',
                'en' => ['name' => 'UI Kits & Design Systems', 'description' => 'Figma components, icons, vectors, and design tokens.'],
            ],
            [
                'slug' => 'source-code-scripts',
                'icon' => 'Code',
                'color' => '#10b981',
                'en' => ['name' => 'Source Code & Scripts', 'description' => 'Full-stack boilerplates, plugins, and backend scripts.'],
            ],
            [
                'slug' => 'software-licenses',
                'icon' => 'Key',
                'color' => '#f59e0b',
                'en' => ['name' => 'Software & License Keys', 'description' => 'Commercial licenses, developer tools, and API activations.'],
            ],
            [
                'slug' => '3d-audio-assets',
                'icon' => 'Box',
                'color' => '#ec4899',
                'en' => ['name' => '3D & Multimedia Assets', 'description' => '3D game models, sound effects, motion graphics.'],
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cData) {
            $cat = Category::firstOrCreate(
                ['slug' => $cData['slug']],
                [
                    'icon' => $cData['icon'],
                    'color' => $cData['color'],
                    'is_active' => true,
                    'sort_order' => 1,
                ]
            );
            $cat->translateOrNew('en')->name = $cData['en']['name'];
            $cat->translateOrNew('en')->description = $cData['en']['description'];
            $cat->save();
            $categories[$cData['slug']] = $cat;
        }

        // 4. Create Products
        $p1 = Product::firstOrCreate(
            ['slug' => 'nextjs-saas-master-boilerplate'],
            [
                'vendor_id' => $vendor2->id,
                'category_id' => $categories['source-code-scripts']->id,
                'price' => 99.00,
                'sale_price' => 69.00,
                'product_type' => ProductType::DOWNLOADABLE_FILE,
                'status' => ProductStatus::PUBLISHED,
                'thumbnail_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
                'preview_images' => [
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000',
                ],
                'demo_url' => 'https://demo.codecraftlabs.io/saas-pro',
                'version' => '2.4.0',
                'download_limit' => 10,
                'expiry_days' => 365,
                'total_sales' => 342,
                'rating_avg' => 4.90,
                'rating_count' => 88,
                'is_featured' => true,
                'attributes' => [
                    'framework' => 'Next.js 15 App Router',
                    'database' => 'PostgreSQL + Prisma / Drizzle',
                    'auth' => 'Auth.js / NextAuth & Clerk',
                    'payments' => 'Stripe & Lemonsqueezy Ready',
                ],
            ]
        );
        $p1->translateOrNew('en')->name = 'Next.js 15 SaaS Pro Starter Kit';
        $p1->translateOrNew('en')->short_description = 'Ship your SaaS in days, not months. Complete with Auth, Multi-tenancy, Stripe Subscriptions, and Admin Dashboard.';
        $p1->translateOrNew('en')->description = "The ultimate Next.js boilerplate designed for developers who want to launch profitable SaaS products rapidly.\n\n### Features:\n- App Router with Server Actions\n- Complete Authentication & Role-Based Access\n- Multi-tenant Organization Support\n- Dark / Light Theme\n- Automated Email Templates with React Email";
        $p1->save();

        ProductFile::firstOrCreate(
            ['product_id' => $p1->id, 'file_name' => 'nextjs-saas-pro-v2.4.0.zip'],
            [
                'original_name' => 'nextjs-saas-pro-v2.4.0.zip',
                'file_size' => 18450200,
                'mime_type' => 'application/zip',
                'storage_disk' => 'local',
                'storage_path' => 'digital_assets/' . $p1->id . '/nextjs-saas-pro-v2.4.0.zip',
                'version' => '2.4.0',
                'is_main' => true,
            ]
        );

        $p2 = Product::firstOrCreate(
            ['slug' => 'nova-tailwind-dashboard-ui-kit'],
            [
                'vendor_id' => $vendor1->id,
                'category_id' => $categories['templates-themes']->id,
                'price' => 49.00,
                'sale_price' => 29.00,
                'product_type' => ProductType::DOWNLOADABLE_FILE,
                'status' => ProductStatus::PUBLISHED,
                'thumbnail_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
                'preview_images' => [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000',
                ],
                'demo_url' => 'https://nova-dashboard.uiforge.design',
                'version' => '1.2.0',
                'download_limit' => 5,
                'expiry_days' => 180,
                'total_sales' => 512,
                'rating_avg' => 4.85,
                'rating_count' => 124,
                'is_featured' => true,
                'attributes' => [
                    'framework' => 'React 19 + Vite + Tailwind CSS',
                    'components_count' => '120+ Components',
                    'charts' => 'Recharts & ApexCharts',
                ],
            ]
        );
        $p2->translateOrNew('en')->name = 'Nova - Modern Tailwind Admin Dashboard';
        $p2->translateOrNew('en')->short_description = 'Pixel-perfect admin template with 120+ custom components, dark mode, analytics widgets, and responsive layout.';
        $p2->translateOrNew('en')->description = "Nova is an ultra-clean, modular Admin Dashboard built specifically for enterprise SaaS and data applications.";
        $p2->save();

        ProductFile::firstOrCreate(
            ['product_id' => $p2->id, 'file_name' => 'nova-dashboard-v1.2.0.zip'],
            [
                'original_name' => 'nova-dashboard-v1.2.0.zip',
                'file_size' => 9240100,
                'mime_type' => 'application/zip',
                'storage_disk' => 'local',
                'storage_path' => 'digital_assets/' . $p2->id . '/nova-dashboard-v1.2.0.zip',
                'version' => '1.2.0',
                'is_main' => true,
            ]
        );

        $p3 = Product::firstOrCreate(
            ['slug' => 'ai-upscaler-studio-license-key'],
            [
                'vendor_id' => $vendor2->id,
                'category_id' => $categories['software-licenses']->id,
                'price' => 129.00,
                'sale_price' => null,
                'product_type' => ProductType::LICENSE_KEY,
                'status' => ProductStatus::PUBLISHED,
                'thumbnail_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
                'preview_images' => [
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000',
                ],
                'demo_url' => 'https://ai-upscaler.codecraftlabs.io',
                'version' => '3.0.0',
                'total_sales' => 189,
                'rating_avg' => 4.95,
                'rating_count' => 42,
                'is_featured' => true,
                'attributes' => [
                    'license_type' => 'Commercial Lifetime Key',
                    'devices_allowed' => '3 Workstations',
                    'updates' => 'Lifetime Free Updates',
                ],
            ]
        );
        $p3->translateOrNew('en')->name = 'AI Upscaler Studio - Commercial Lifetime License';
        $p3->translateOrNew('en')->short_description = '4K/8K Neural Image & Video Upscaling software for desktop. Lifetime license key with instant activation.';
        $p3->translateOrNew('en')->description = "Enhance resolution and clarity of your graphics with local GPU AI models.";
        $p3->save();

        // Seed sample license keys for p3
        for ($i = 1; $i <= 5; $i++) {
            ProductLicenseKey::firstOrCreate(
                ['license_key' => 'AIUP-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4)) . '-' . strtoupper(Str::random(4))],
                [
                    'product_id' => $p3->id,
                    'status' => LicenseKeyStatus::AVAILABLE,
                    'max_activations' => 3,
                    'activation_count' => 0,
                ]
            );
        }

        // 5. Seed Wallets
        $wallet1 = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor1->id],
            [
                'balance' => 3420.50,
                'holding_balance' => 450.00,
                'total_earned' => 14850.00,
                'total_withdrawn' => 10979.50,
                'currency' => 'USD',
            ]
        );

        $wallet2 = VendorWallet::firstOrCreate(
            ['vendor_id' => $vendor2->id],
            [
                'balance' => 5890.00,
                'holding_balance' => 820.00,
                'total_earned' => 28450.00,
                'total_withdrawn' => 21740.00,
                'currency' => 'USD',
            ]
        );

        // 6. Seed an Initial Completed Order for Buyer
        $order = Order::firstOrCreate(
            ['order_number' => 'ORD-2026-DEMO-001'],
            [
                'buyer_id' => $buyer->id,
                'subtotal_amount' => 98.00,
                'discount_amount' => 0.00,
                'total_amount' => 98.00,
                'payment_method' => 'platform_gateway',
                'payment_status' => PaymentStatus::PAID,
                'transaction_id' => 'TXN-DEMO-998811',
                'customer_email' => $buyer->email,
                'paid_at' => Carbon::now()->subDays(2),
            ]
        );

        $item1 = OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'product_id' => $p1->id],
            [
                'vendor_id' => $vendor2->id,
                'product_name' => $p1->name,
                'product_type' => $p1->product_type->value,
                'price' => 69.00,
                'commission_rate' => 15.00,
                'commission_amount' => 10.35,
                'vendor_earning' => 58.65,
                'status' => 'completed',
            ]
        );

        OrderDownload::firstOrCreate(
            ['order_item_id' => $item1->id],
            [
                'product_file_id' => $p1->files()->first()->id,
                'download_token' => 'sample_download_token_nextjs_saas_pro_123456789',
                'download_count' => 1,
                'max_downloads' => 10,
                'expires_at' => Carbon::now()->addDays(360),
                'last_downloaded_at' => Carbon::now()->subHours(12),
            ]
        );

        $item2 = OrderItem::firstOrCreate(
            ['order_id' => $order->id, 'product_id' => $p2->id],
            [
                'vendor_id' => $vendor1->id,
                'product_name' => $p2->name,
                'product_type' => $p2->product_type->value,
                'price' => 29.00,
                'commission_rate' => 12.50,
                'commission_amount' => 3.63,
                'vendor_earning' => 25.37,
                'status' => 'completed',
            ]
        );

        OrderDownload::firstOrCreate(
            ['order_item_id' => $item2->id],
            [
                'product_file_id' => $p2->files()->first()->id,
                'download_token' => 'sample_download_token_nova_dashboard_987654321',
                'download_count' => 0,
                'max_downloads' => 5,
                'expires_at' => Carbon::now()->addDays(180),
            ]
        );

        // Reviews
        Review::firstOrCreate(
            ['product_id' => $p1->id, 'buyer_id' => $buyer->id],
            [
                'order_item_id' => $item1->id,
                'rating' => 5,
                'comment' => 'Saved me at least 3 weeks of boilerplate code. The Auth and Stripe integrations are top-notch!',
                'status' => 'published',
            ]
        );

        Review::firstOrCreate(
            ['product_id' => $p2->id, 'buyer_id' => $buyer->id],
            [
                'order_item_id' => $item2->id,
                'rating' => 5,
                'comment' => 'Super slick UI and well-structured React components. Highly recommend.',
                'status' => 'published',
            ]
        );
    }
}
