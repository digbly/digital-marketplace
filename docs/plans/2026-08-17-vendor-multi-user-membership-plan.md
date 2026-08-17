---
title: Vendor Multi-User Membership & Role Management - Plan
type: feat
date: 2026-08-17
topic: vendor-multi-user-membership
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Vendor Multi-User Membership & Role Management - Plan

## Goal Capsule

- **Objective:** Separate the 1:1 `user_id` foreign key from the `vendors` table into a dedicated `vendor_users` membership table to support Many-to-Many relationships with role-based access control (`owner`, `manager`, `staff`) and route-parameter-scoped Vendor APIs (`/api/vendors/{vendor}/...`).
- **Product Authority:** Covers multi-user vendor support, member CRUD, and scoped vendor endpoints. Email invitations and granular permission matrices are out of scope for this phase.
- **Open Blockers:** None.

## Problem Frame

Previously, each vendor record had a direct foreign key `user_id` pointing to a single user in the `vendors` table. This constrained each store to a single user account and each user to a single vendor. In real-world multi-vendor digital marketplaces, a store often has multiple team members (owners, store managers, and support/fulfillment staff), and power sellers or agencies may operate or participate in multiple distinct stores.

## Key Decisions

- **Many-to-Many with Roles:** (session-settled: user-directed — chosen over 1:N or flat pivot: supports multi-store creators and internal team hierarchy) Implement a dedicated `vendor_users` pivot model with roles (`owner`, `manager`, `staff`).
- **Route-Parameter Scoped Endpoints:** (session-settled: user-directed — chosen over `X-Vendor-Id` header: RESTful URL clarity and explicit resource hierarchy) Update Vendor API routes from `/api/vendor/*` to `/api/vendors/{vendor}/*`.
- **Direct Member Management:** (session-settled: user-directed — chosen over email invitation tokens: rapid delivery of core membership API) Store owners/managers can directly add existing users by email/user_id, update member roles, and remove members.
- **Role Permissions Hierarchy:**
  - `owner`: Full control (store profile, delete store, financial payouts/wallet, manage members, products, orders).
  - `manager`: Operational control (store profile, products, orders, add/manage staff members). Cannot request payouts or transfer store ownership.
  - `staff`: Execution control (view/update products, view orders). Cannot manage members or access wallet.

## Requirements

### Data Architecture & Models
- **R1.** Create `vendor_users` table with UUID primary key, `vendor_id` (foreign UUID), `user_id` (foreign UUID), `role` (string/enum), unique constraint on `(vendor_id, user_id)`, and timestamps.
- **R2.** Create `App\Enums\VendorUserRole` PHP enum containing `OWNER = 'owner'`, `MANAGER = 'manager'`, `STAFF = 'staff'`.
- **R3.** Create `App\Models\VendorUser` Eloquent model with proper casts and relationships (`vendor()`, `user()`).
- **R4.** Update `App\Models\Vendor` to remove single `user_id`, add `vendorUsers(): HasMany` and `users(): BelongsToMany` (with pivot role), and add helper methods `isOwner(User $user)`, `hasMember(User $user)`, `getUserRole(User $user)`.
- **R5.** Update `App\Models\User` with `vendorUsers(): HasMany` and `vendors(): BelongsToMany`.

### Authorization & Middleware
- **R6.** Create `App\Http\Middleware\EnsureVendorMember` to intercept `/api/vendors/{vendor}/*` requests, bind and validate that the authenticated user is a valid member of the requested vendor with optional minimum role check.
- **R7.** Create `App\Policies\VendorPolicy` defining authorization gates for `view`, `update`, `manageMembers`, `manageProducts`, `manageWallet`.

### Member Management & Scoped Vendor APIs
- **R8.** Implement Vendor listing and creation endpoints:
  - `GET /api/vendors`: Returns list of all vendors the authenticated user belongs to.
  - `POST /api/vendors`: Create a new vendor (creator automatically becomes `owner` in `vendor_users`).
- **R9.** Implement Member Management endpoints under `/api/vendors/{vendor}/members`:
  - `GET /api/vendors/{vendor}/members`: List all members and their roles.
  - `POST /api/vendors/{vendor}/members`: Add user as a member with assigned role (Requires `owner` or `manager`).
  - `PUT /api/vendors/{vendor}/members/{user}`: Update member role (Requires `owner` or `manager`).
  - `DELETE /api/vendors/{vendor}/members/{user}`: Remove member from vendor (Requires `owner` or `manager`; owners cannot remove themselves if they are the sole owner).
- **R10.** Refactor existing Vendor Portal controllers to use `/api/vendors/{vendor}/...`:
  - `GET|PUT /api/vendors/{vendor}/profile`
  - `GET|POST|PUT|DELETE /api/vendors/{vendor}/products...`
  - `GET /api/vendors/{vendor}/orders...`
  - `GET /api/vendors/{vendor}/wallet` & `POST /api/vendors/{vendor}/payouts`

### OpenAPI & Documentation
- **R11.** All FormRequests and API Resources must have `#[OA\Schema(schema: __CLASS__, ...)]` attributes with typed properties.
- **R12.** All Controller methods must include OpenAPI annotations referencing classes with `::class`.

## Key Flows

### Flow 1: Create Store and Assign Owner
1. Authenticated user sends `POST /api/vendors` with `store_name`, `slug`, `bio`, etc.
2. In a database transaction, the `Vendor` record is created and a `VendorUser` record is created with `role => VendorUserRole::OWNER`.
3. User's role is updated to `UserRole::VENDOR` if they are currently a customer.
4. Response returns the created vendor and membership details.

### Flow 2: Add and Manage Store Members
1. Store owner sends `POST /api/vendors/{vendor}/members` with `email` (or `user_id`) and `role: manager`.
2. Middleware validates the requester is an `owner` of the vendor.
3. System finds the user by email, creates `vendor_users` record, and returns 201 Created with `VendorUserResource`.

## Scope Boundaries

### In Scope
- Database schema and migration for `vendor_users`.
- Migration update for `vendors` table (removing direct `user_id` constraint).
- `VendorUser` model and `VendorUserRole` enum.
- `EnsureVendorMember` middleware and `VendorPolicy`.
- `VendorController` and `VendorMemberController`.
- Refactoring `VendorProfileController`, `VendorProductController`, `VendorOrderController`, `VendorWalletController` to scoped vendor routes.
- Unit and Feature tests for multi-user vendor interactions.
- Updated `DigitalMarketplaceSeeder`.

### Out of Scope (Deferred)
- Email invitation token workflow (sending invite emails with expiration tokens).
- Dynamic custom permissions per user (e.g. granular spatie permissions per vendor).

## Implementation Units

### Unit 1: Database Migrations & Enums
- **Files:**
  - `api/app/Enums/VendorUserRole.php` [NEW]
  - `api/database/migrations/2026_08_17_000013_create_vendor_users_table.php` [NEW]
  - `api/database/migrations/2026_08_17_000002_create_vendors_table.php` [MODIFY]
- **Verification:** Run `php artisan migrate --path=database/migrations/...` and verify table schema.

### Unit 2: Models & Relationships
- **Files:**
  - `api/app/Models/VendorUser.php` [NEW]
  - `api/app/Models/Vendor.php` [MODIFY]
  - `api/app/Models/User.php` [MODIFY]
- **Verification:** Test Eloquent relationships in Tinker or unit tests.

### Unit 3: Middleware & Authorization Policies
- **Files:**
  - `api/app/Http/Middleware/EnsureVendorMember.php` [NEW]
  - `api/app/Policies/VendorPolicy.php` [NEW]
  - `api/bootstrap/app.php` [MODIFY] (register middleware alias if needed)
- **Verification:** Middleware correctly rejects non-members with 403 Forbidden.

### Unit 4: FormRequests & Resources
- **Files:**
  - `api/app/Http/Requests/Vendor/CreateVendorRequest.php` [NEW]
  - `api/app/Http/Requests/Vendor/StoreVendorUserRequest.php` [NEW]
  - `api/app/Http/Requests/Vendor/UpdateVendorUserRequest.php` [NEW]
  - `api/app/Http/Resources/VendorUserResource.php` [NEW]
  - `api/app/Http/Resources/VendorResource.php` [MODIFY]
- **Verification:** Validate Swagger annotations and request validation rules.

### Unit 5: Controllers & Routes Refactoring
- **Files:**
  - `api/app/Http/Controllers/Vendor/VendorController.php` [NEW]
  - `api/app/Http/Controllers/Vendor/VendorMemberController.php` [NEW]
  - `api/app/Http/Controllers/Vendor/VendorProfileController.php` [MODIFY]
  - `api/app/Http/Controllers/Vendor/VendorProductController.php` [MODIFY]
  - `api/app/Http/Controllers/Vendor/VendorOrderController.php` [MODIFY]
  - `api/app/Http/Controllers/Vendor/VendorWalletController.php` [MODIFY]
  - `api/routes/api.php` [MODIFY]
- **Verification:** All vendor endpoints accept `{vendor}` parameter and enforce authorization.

### Unit 6: Seeder & Feature Tests
- **Files:**
  - `api/database/seeders/DigitalMarketplaceSeeder.php` [MODIFY]
  - `api/tests/Feature/Vendor/VendorMembershipTest.php` [NEW]
  - `api/tests/Feature/Vendor/VendorScopedApiTest.php` [NEW]
- **Verification:** Run `php artisan test --filter=Vendor` to ensure all tests pass.
