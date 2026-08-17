# Concepts

> Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Core Entities

### Product Format (`product_type`)
The delivery mechanism of a digital item sold on the marketplace.
- `downloadable_file`: Direct file package (e.g. `.zip`, `.fig`, `.pdf`) stored in private encrypted storage.
- `license_key`: Software activation key with quota limits (e.g. 3 workstations).
- `bundle`: Multi-item package bundling both downloadable files and software license keys.

### Vendor Store (`vendor`)
An approved creator or developer profile selling digital assets. Each vendor has a configurable commission rate (e.g. 12.5% to 15.0%), public storefront branding, and connected payout account details.

### Private Digital Asset (`product_file`)
A physical file archive attached to a product, stored in `storage/app/private/digital_assets/{product_id}/`. Never directly accessible via web public URLs.

### License Key Pool (`product_license_key`)
A pool of pre-populated or dynamically generated activation keys assigned atomically (`lockForUpdate()`) to order items upon successful payment.

### Secure Order Download (`order_download`)
An access grant representing an authorized customer download link governed by a unique single-use or quota-bounded token (`download_token`), download limit counter, and expiration timestamp.

### Vendor Wallet & Ledger (`vendor_wallet`, `wallet_transaction`)
The platform financial ledger tracking vendor net revenues (`effective_price - commission_amount`), escrow holding balances, and withdrawal payout deductions.

### Payout Request (`payout_request`)
A vendor withdrawal workflow where funds are reserved from available wallet balance and reviewed/settled by a Super Admin via bank transfer or PayPal.
