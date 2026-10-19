# ZOMNTU payments with VMT PayFast

ZOMNTU now pins `Mabonax/vmt-payfast` through Composer and commits the resolved package revision in `composer.lock`.

## Sandbox configuration

Copy the PayFast values from `.env.example` into the local or staging `.env` and use a dedicated sandbox merchant:

```dotenv
PAYFAST_MODE=sandbox
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
PAYFAST_RETURN_URL=https://your-staging-host/payments/payfast/return
PAYFAST_CANCEL_URL=https://your-staging-host/payments/payfast/cancel
PAYFAST_NOTIFY_URL=https://your-staging-host/payments/payfast/notify
```

The callback URLs must be HTTPS for staging/production and the passphrase must match the PayFast account.

## Application guarantees

- Prices are rebuilt from server-side catalogue and variant records; checkout never trusts a browser-supplied amount.
- Stock is reserved before checkout and abandoned reservations are released by `orders:release-expired`.
- The order is marked paid only from the package's verified `PaymentCompleted` event.
- Fulfilment uses `FulfilmentService::once` for payment-event idempotency.
- Browser return/cancel routes never mark an order paid.
- The `view-payfast-payment` gate restricts payment-state disclosure to the shopper who owns the referenced order.
- The package outbox is dispatched every minute by Laravel's scheduler.

## Operations required

Run a durable queue worker and Laravel scheduler in production:

```bash
php artisan queue:work
php artisan schedule:work
```

Create the public storage link once on each deployment if local public-disk product images are used:

```bash
php artisan storage:link
```

Before enabling live funds, complete a real PayFast sandbox journey in the deployed ZOMNTU application and follow the package's `APPLICATION_INTEGRATION.md`, `PRODUCTION_READINESS.md`, and `PRODUCTION_OPERATIONS.md`. The package's current `dev-main` lock is reproducible, but live-payment approval still requires the documented host staging acceptance.
