<?php

namespace App\Listeners;

use App\Models\Coupon;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Vmt\PayFast\Events\PaymentCompleted;
use Vmt\PayFast\Services\FulfilmentService;

final class CompleteZomntuOrder implements ShouldQueue
{
    public function __construct(private readonly FulfilmentService $fulfilment) {}

    public function handle(PaymentCompleted $event): void
    {
        $this->fulfilment->once(
            $event->transactionId,
            $event->merchantIdentity,
            $event->tenantId,
            'zomntu-order-paid-v2',
            function ($payment) use ($event): void {
                DB::transaction(function () use ($event, $payment): void {
                    $order = Order::query()
                        ->where('reference', $payment->order_reference)
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
                                $variant = $item->variant()
                                    ->lockForUpdate()
                                    ->first();

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
                                'payment_transaction_id' => $event->transactionId,
                                'paid_at' => now(),
                            ]);

                            return;
                        }

                        foreach ($order->items as $item) {
                            if ($item->variant) {
                                $item->variant()
                                    ->lockForUpdate()
                                    ->first()
                                    ?->increment('reserved_stock', $item->quantity);
                            } else {
                                $item->product()
                                    ->lockForUpdate()
                                    ->first()
                                    ?->decrement('stock', $item->quantity);
                            }
                        }
                    }

                    foreach ($order->items as $item) {
                        if ($item->variant) {
                            $variant = $item->variant()
                                ->lockForUpdate()
                                ->first();

                            if ($variant) {
                                $variant->reserved_stock = max(
                                    0,
                                    $variant->reserved_stock - $item->quantity,
                                );
                                $variant->stock = max(
                                    0,
                                    $variant->stock - $item->quantity,
                                );
                                $variant->save();
                            }
                        }
                    }

                    if ($order->coupon_code) {
                        Coupon::query()
                            ->where('code', $order->coupon_code)
                            ->lockForUpdate()
                            ->first()
                            ?->increment('uses');
                    }

                    $order->update([
                        'status' => 'paid',
                        'payment_transaction_id' => $event->transactionId,
                        'paid_at' => now(),
                    ]);
                });
            },
        );
    }
}
