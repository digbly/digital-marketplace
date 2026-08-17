# Digital Marketplace

A multi-vendor digital marketplace connecting creators and buyers of digital products. Vendors list and sell their digital assets — downloadable files, software license keys, or bundled packages — while buyers discover, purchase, and securely access their purchases through a personal library.

The platform supports three user roles: **Buyers** browse the storefront and manage their purchases; **Vendors** run their own store with product management, revenue tracking, and payout requests; **Admins** oversee the marketplace with vendor approvals, product moderation, commission management, and analytics.

Payments flow through a centralized wallet with escrow, and digital delivery is handled via signed temporary URLs and automatic license key assignment — keeping assets secure and access controlled.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 12 · PHP 8.2+ · MySQL |
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS 4 |
| **Auth** | Laravel Passport (OAuth2) · Social Login (Google, GitHub, Facebook) |
| **State** | Redux Toolkit · Zustand · React Query |
| **API Docs** | Swagger (L5-Swagger) |
| **Media** | Spatie Media Library · Private encrypted storage |

## Project Structure

```
digital-marketplace/
├── api/                  # Laravel API backend
│   ├── app/
│   │   ├── Enums/        # Domain enums (roles, statuses, types)
│   │   ├── Http/
│   │   │   ├── Controllers/  # API controllers
│   │   │   ├── Middleware/
│   │   │   ├── Requests/     # Form request validation
│   │   │   └── Resources/    # API resource transformers
│   │   ├── Models/       # Eloquent models
│   │   ├── Policies/     # Authorization policies
│   │   ├── Services/     # Business logic services
│   │   └── Traits/       # Reusable traits
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   ├── modules/          # Modular packages (Payment, etc.)
│   └── routes/
│       ├── api.php       # API routes
│       └── web.php
├── web/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── store/
│   │   ├── views/
│   │   ├── types/
│   │   └── utils/
│   └── vite.config.ts
├── docs/                 # Plans, solutions, architecture docs
└── CONCEPTS.md           # Domain vocabulary glossary
```

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18 & npm
- MySQL >= 8.0

### Backend Setup

```bash
cd api

# Install dependencies
composer install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate
php artisan db:seed

# Passport keys & password grant client
php artisan passport:install

# Create password grant client (used for API login via HasPassportPasswordGrant trait)
php artisan passport:client --password --name="Client-Web"

# After creating, add the client ID and secret to .env:
#   PASSPORT_PASSWORD_CLIENT_ID=<password client ID>
#   PASSPORT_PASSWORD_CLIENT_SECRET=<password client secret>
#
# These are read by config/auth.php → auth.providers.users.passport
# and used by AppServiceProvider::boot() which enables the password grant,
# sets token lifetimes (15 days access, 30 days refresh, 6 months personal).

# Storage symlink
php artisan storage:link

# Start dev server
php artisan serve
```

### Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Environment
cp .env.example .env

# Start dev server
npm run dev
```

## API Documentation

Swagger UI is available at `/api/documentation` when the backend is running.

Generate/update docs:

```bash
cd api
php artisan l5-swagger:generate
```

## Key Features

### Three User Roles

- **Buyer** — Browse products, purchase digital assets, access downloads & license keys in personal library
- **Vendor** — Register a store, list products (files, keys, bundles), track revenue, request payouts
- **Admin** — Approve vendors & products, manage platform commission rates, process payout requests, view analytics

### Digital Product Delivery

- Encrypted private storage for downloadable files
- Signed temporary download URLs with expiration and quota limits
- Automatic license key pool assignment on purchase

### Payment & Settlement

- Multi-gateway payment processing (Stripe, PayPal, Mock Sandbox)
- Idempotent webhook handling for reliable settlement
- Platform wallet with escrow holding and withdrawal workflow

### Vendor Multi-User

- Vendors can invite team members with role-based access
- Separate vendor user management from platform user accounts

## Testing

```bash
# Backend tests
cd api
php artisan test

# Frontend lint
cd web
npm run lint
```

Domain vocabulary is documented in [`CONCEPTS.md`](CONCEPTS.md).

## License

MIT
