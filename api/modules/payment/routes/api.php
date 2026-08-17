<?php

use Illuminate\Support\Facades\Route;
use Modules\Payment\Http\Controllers\PaymentController;
use Modules\Payment\Http\Controllers\PaymentWebhookController;

Route::prefix('webhooks/payment')->group(function () {
    Route::post('{gateway}', [PaymentWebhookController::class, 'handleWebhook'])->name('payment.webhook');
});

Route::prefix('payments')->group(function () {
    Route::get('{id}/status', [PaymentController::class, 'status'])->name('payment.status');
    Route::get('mock/return/{payment_id}', [PaymentController::class, 'mockReturn'])->name('payment.mock.return');
});
