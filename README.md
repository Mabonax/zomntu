# ZOMNTU Commerce

Laravel 13 + React/Inertia ecommerce implementation for the ZOMNTU fashion brand.

## Roles

- shopper — browses, adds to bag, pays, and tracks orders
- administrator — manages products, pricing, stock, coupons, and order fulfilment

New authenticated users default to `shopper`. Promote the first administrator directly in the database or with Tinker:

```php
App\Models\User::where('email', 'you@example.com')->update(['role' => 'administrator']);
```

## Setup

```bash
composer setup
php artisan migrate
npm run dev
```

Authentication remains the Laravel WorkOS starter-kit flow already present in the repository.

## Payments

Checkout is integrated against the public interfaces from `Mabonax/vmt-payfast`. See `docs/PAYMENTS.md` for installation and staging instructions. Until the package is installed, checkout deliberately fails closed instead of inventing an alternative payment implementation.

## Main routes

- `/` — storefront matching the approved ZOMNTU visual direction
- `/shop` — active products
- `/cart` — session cart and PayFast checkout
- `/account/orders` — shopper order tracking
- `/admin` — administrator catalogue, coupons and orders
