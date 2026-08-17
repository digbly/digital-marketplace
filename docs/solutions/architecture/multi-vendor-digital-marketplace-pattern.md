---
title: "Multi-Vendor Digital Marketplace Architecture Pattern"
date: "2026-08-17"
category: "architecture"
module: "e-commerce"
problem_type: "architecture_pattern"
component: "service_object"
severity: "medium"
applies_when:
  - "Designing or extending a multi-vendor digital asset marketplace with downloadable files, license keys, and platform wallet"
tags:
  - "digital-goods"
  - "multi-vendor"
  - "token-streaming"
  - "license-keys"
  - "escrow-wallet"
---

# Multi-Vendor Digital Marketplace Architecture Pattern

## Context
Migrating a legacy CMS / website builder into a specialized multi-vendor marketplace for digital products (source code, templates, UI kits, software licenses, 3D assets) requires solving three distinct architectural challenges:
1. **Asset Security**: Delivering digital files without exposing direct web-accessible storage paths or permanent URLs.
2. **License Key Management**: Seamlessly allocating pre-existing license key pools or dynamically generating keys on demand with activation tracking.
3. **Escrow & Commission Accounting**: Splitting order revenue between marketplace platform fees and vendor balances with holding escrow buffers and withdrawal controls.

## Guidance

### 1. Private Storage & Expiring Token Delivery
Digital product files are placed in private storage (`storage/app/private/digital_assets/{product_id}/`) on disk `local` (or S3 in production). Upon order settlement, `DigitalDeliveryService` creates an `OrderDownload` record with an expiring unique token and download counter.

```php
// api/app/Services/DigitalDeliveryService.php
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
```

### 2. License Key Allocation with Concurrency Safety
For software licenses and bundle items, the system utilizes database row locks (`lockForUpdate()`) to assign available keys from the `product_license_keys` pool. If the vendor's key pool is exhausted, the delivery engine falls back to auto-generating a cryptographically secure structured license key.

### 3. Ledger-Backed Vendor Wallet & Payout Lifecycle
Instead of instant direct payout splits, all customer payments settle into the platform gateway. The net vendor earnings (`effective_price - commission_amount`) are credited to the `vendor_wallets` balance, with each balance change tracked immutably in `wallet_transactions`. When a vendor requests a withdrawal, `PayoutService` reserves the funds; if an admin rejects the request, the funds are automatically refunded to the available balance.

## Why This Matters
- **Zero URL Leakage**: Customers cannot hotlink or share permanent storage links.
- **Race Condition Prevention**: Database locks prevent double-assignment of unique license keys during flash sales.
- **Financial Auditability**: Double-entry ledger records prevent discrepancy between order totals and vendor payouts.

## When to Apply
- When building or refactoring digital product checkout, delivery, and vendor payout subsystems.

## Examples
See full service implementations:
- [`api/app/Services/DigitalDeliveryService.php`](file:///Users/dev/projects/test2/api/app/Services/DigitalDeliveryService.php)
- [`api/app/Services/OrderService.php`](file:///Users/dev/projects/test2/api/app/Services/OrderService.php)
- [`api/app/Services/PayoutService.php`](file:///Users/dev/projects/test2/api/app/Services/PayoutService.php)

## Related
- Plan: [`docs/plans/2026-08-17-multi-vendor-digital-ecommerce-plan.md`](file:///Users/dev/projects/test2/docs/plans/2026-08-17-multi-vendor-digital-ecommerce-plan.md)
