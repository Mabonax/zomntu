# ZOMNTU payments with VMT PayFast

ZOMNTU checkout is wired to the public interfaces and verified completion event from the separate `Mabonax/vmt-payfast` package.

Before enabling checkout in staging:

```bash
composer config repositories.vmt-payfast vcs https://github.com/Mabonax/vmt-payfast.git
composer require vmt/payfast:dev-main
php artisan vendor:publish --tag=payfast-config
php artisan migrate
```

Use sandbox credentials first. The checkout route never trusts a browser-supplied price: totals are rebuilt from active products in the database and the PayFast request is created from the persisted order.

The `CompleteZomntuOrder` queued listener marks an order paid only after `vmt/payfast` dispatches a verified `PaymentCompleted` event and uses the package fulfilment ledger for idempotency.

For production, follow the package's `APPLICATION_INTEGRATION.md` and `PRODUCTION_OPERATIONS.md`, pin a reviewed release, commit the resulting Composer lock file, run a host-app sandbox journey, and keep durable queue workers plus the scheduled `payfast:dispatch-outbox` command running.
