<?php

namespace App\Listeners;

use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use RuntimeException;

final class CompleteZomntuOrder implements ShouldQueue
{
    public function handle(object $event): void
    {
        $transactionId = (string) data_get($event, 'transactionId');
        $merchantIdentity = (string) data_get($event, 'merchantIdentity');
        $tenantId = data_get($event, 'tenantId');

        if ($transactionId === '' || $merchantIdentity === '') {
            throw new RuntimeException('Invalid PayFast completion event payload.');
        }

        $fulfilmentClass = 'Vmt\\PayFast\\Services\\FulfilmentService';

        if (! class_exists($fulfilmentClass)) {
            throw new RuntimeException('vmt/payfast fulfilment service is unavailable.');
        }

        $fulfilment = app($fulfilmentClass);

        $fulfilment->once(
            $transactionId,
            $merchantIdentity,
            is_string($tenantId) ? $tenantId : null,
            'zomntu-order-paid-v2',
            function ($payment) use ($transactionId): void {
                DB::transaction(function () use ($transactionId, $payment): void {
                    $orderReference = (string) data_get($payment, 'order_reference');

                    $order = Order::query()
                        ->where('reference', $orderReference)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($order->paid_at) {
                        return;
                    }

                    $order->load(['items.variant', 'items.product']);

                    if ($order->status === 'cancelled') {
                        $canRecover = true;

                        foreach ($order->items as $item) {
                            if ($item->variant) {
                                $variant = $item->variant()->lockForUpdate()->first();

                                if (! $variant || $variant->availableStock() < $item->quantity) {
                                    $canRecover = false;
                                    break;
                                }
                            } elseif (! $item->product || $item->product->stock < $item->quantity) {
                                $canRecover = false;
                                break;
                            }
                        }

                        if (! $canRecover) {
                            $order->update([
                                'status' => 'payment_review',
                                'payment_transaction_id' => $transactionId,
                                'paid_at' => now(),
                            ]);

                            return;
                        }

                        foreach ($order->items as $item) {
                            if ($item->variant) {
                                $item->variant()->lockForUpdate()->first()?->increment('reserved_stock', $item->quantity);
                            } else {
                                $item->product()->lockForUpdate()->first()?->decrement('stock', $item->quantity);
                            }
                        }
                    }

                    foreach ($order->items as $item) {
                        if ($item->variant) {
                            $variant = $item->variant()->lockForUpdate()->first();

                            if ($variant) {
                                $variant->reserved_stock = max(0, $variant->reserved_stock - $item->quantity);
                                $variant->stock = max(0, $variant->stock - $item->quantity);
                                $variant->save();
                            }
                        }
                    }

                    if ($order->coupon_code) {
                        Coupon::query()
                            ->where('code', $order->coupon_code)
                            ->lockForUpdate()
                            ->first()?->increment('uses');
                    }

                    $order->update([
                        'status' => 'paid',
                        'payment_transaction_id' => $transactionId,
                        'paid_at' => now(),
                    ]);
                });
            }
        );
    }
}
