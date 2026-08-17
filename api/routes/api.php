<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminPayoutController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminVendorController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Buyer\LibraryController;
use App\Http\Controllers\Storefront\CategoryController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\ProductController;
use App\Http\Controllers\Vendor\VendorOrderController;
use App\Http\Controllers\Vendor\VendorProductController;
use App\Http\Controllers\Vendor\VendorProfileController;
use App\Http\Controllers\Vendor\VendorWalletController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Multi-Vendor Digital E-Commerce Platform
|--------------------------------------------------------------------------
*/

// Authentication Routes
Route::prefix('auth/user')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh-token', [AuthController::class, 'refreshToken']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('resend-verification-email', [AuthController::class, 'resendVerificationEmail']);
    Route::post('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

    Route::get('social/{driver}/redirect', [SocialLoginController::class, 'redirect'])->name('api.user.social.redirect');
    Route::post('social/{driver}/callback', [SocialLoginController::class, 'callback'])->name('api.user.social.callback');

    Route::middleware('auth:api')->group(function () {
        Route::put('change-password', [AuthController::class, 'changePassword']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Storefront (Public API)
Route::prefix('storefront')->group(function () {
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);

    // Authenticated checkout
    Route::middleware('auth:api')->post('checkout', [CheckoutController::class, 'checkout']);
});

// Buyer Area
Route::prefix('buyer')->group(function () {
    // Secure token download (accessible via token)
    Route::get('download/{token}', [LibraryController::class, 'download']);

    Route::middleware('auth:api')->group(function () {
        Route::get('library', [LibraryController::class, 'index']);
        Route::post('reviews', [LibraryController::class, 'storeReview']);
    });
});

// Vendor Portal Area
Route::prefix('vendor')->middleware('auth:api')->group(function () {
    Route::get('profile', [VendorProfileController::class, 'show']);
    Route::put('profile', [VendorProfileController::class, 'update']);

    // Products & Assets
    Route::get('products', [VendorProductController::class, 'index']);
    Route::post('products', [VendorProductController::class, 'store']);
    Route::put('products/{id}', [VendorProductController::class, 'update']);
    Route::delete('products/{id}', [VendorProductController::class, 'destroy']);
    Route::post('products/{id}/files', [VendorProductController::class, 'uploadFile']);
    Route::post('products/{id}/license-keys', [VendorProductController::class, 'importLicenseKeys']);

    // Orders & Sales
    Route::get('orders', [VendorOrderController::class, 'index']);

    // Wallet & Payout
    Route::get('wallet', [VendorWalletController::class, 'index']);
    Route::post('payouts', [VendorWalletController::class, 'requestPayout']);
});

// Super Admin Area
Route::prefix('admin')->middleware('auth:api')->group(function () {
    Route::get('analytics', [AdminAnalyticsController::class, 'index']);

    Route::get('vendors', [AdminVendorController::class, 'index']);
    Route::put('vendors/{id}/status', [AdminVendorController::class, 'updateStatus']);

    Route::get('products', [AdminProductController::class, 'index']);
    Route::put('products/{id}/moderate', [AdminProductController::class, 'moderate']);

    Route::get('payouts', [AdminPayoutController::class, 'index']);
    Route::put('payouts/{id}/process', [AdminPayoutController::class, 'process']);
});
