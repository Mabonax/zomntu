# ZOMNTU Commerce

ZOMNTU is a Laravel 13 + React/Inertia ecommerce store for the South African fashion label, with a premium editorial storefront, authenticated shopping, inventory-aware checkout, PayFast payments and a compact administrator workspace.

## Roles

There are only two application roles:

- **shopper** — browses, maintains a bag, checks out, and tracks orders.
- **administrator** — manages products, variants, pricing, stock, imagery, coupons and fulfilment.

New authenticated users default to `shopper`. Promote the first administrator with Tinker:

```php
App\Models\User::where('email', 'you@example.com')
    ->update(['role' => 'administrator']);
```

Administrator accounts cannot be deleted through the self-service profile flow, and customer deletion does not erase historical order records.

## Local setup

```bash
composer setup
php artisan db:seed
php artisan storage:link
npm run dev
```

Configure WorkOS for authentication and PayFast sandbox values using `.env.example`.

## Commerce capabilities

- ZOMNTU editorial storefront matching the approved visual direction.
- Catalogue search, category filtering, sorting and pagination.
- Product detail pages, size/colour variants, stock availability and related products.
- Guest shopping bag that survives the sign-in redirect.
- Authenticated PayFast checkout with server-authoritative pricing.
- Variant stock reservation and automatic release of abandoned unpaid orders.
- Percentage/fixed coupons, usage windows and limits.
- Order history with fulfilment timeline and courier tracking number.
- Product/variant creation, product image upload, catalogue status, pricing and stock controls.
- Administrator-only order fulfilment transitions.
- Verified PayFast ITN fulfilment with durable package outbox and idempotency.
- Production JavaScript/PHP dependency audits, TypeScript, Pint, PHPStan and Pest in CI.

## Payment integration

`vmt/payfast` is now a Composer dependency pinned in `composer.lock`. See `docs/PAYMENTS.md` for sandbox configuration, callbacks and production acceptance requirements.

## Main routes

- `/` — storefront
- `/shop` — catalogue
- `/shop/{slug}` — product detail
- `/cart` — bag and checkout
- `/account/orders` — shopper orders and tracking
- `/admin` — administrator commerce workspace

## Deployment minimums

Production requires HTTPS, MySQL, persistent public/object storage for product media, a supervised queue worker, Laravel scheduler, configured mail transport, WorkOS credentials and approved PayFast production credentials. Keep `APP_DEBUG=false`, retain `APP_KEY`, back up the database before migrations, and deploy with `composer install` against the committed lock file.
