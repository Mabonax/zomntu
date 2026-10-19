<?php

namespace App\Listeners;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\DB;
use Vmt\PayFast\Events\PaymentCompleted;
use Vmt\PayFast\Services\FulfilmentService;

final class CompleteZomntuOrder implements ShouldQueue
{
    public function __construct(private FulfilmentService $fulfilment) {}

    public function handle(PaymentCompleted $event): void
    {
        $this->fulfilment->once(
            $event->transactionId,
            $event->merchantIdentity,
            $event->tenantId,
            'zomntu-order-paid-v1',
            function ($payment) use ($event): void {
                DB::transaction(function () use ($event, $payment): void {
                    $order = Order::query()
                        ->where('reference', $payment->order_reference)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($order->paid_at) {
                        return;
                    }

                    $order->update([
                        'status' => 'paid',
                        'payment_transaction_id' => $event->transactionId,
                        'paid_at' => now(),
                    ]);

                    foreach ($order->items as $item) {
                        if ($item->product_id) {
                            $product = $item->product()->lockForUpdate()->first();

                            if ($product) {
                                $product->decrement('stock', min($product->stock, $item->quantity));
                            }
                        }
                    }
                });
            }
        );
    }
}
