<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReleaseExpiredOrders extends Command
{
    protected $signature = 'orders:release-expired';

    protected $description = 'Release stock reservations for unpaid ZOMNTU orders that expired.';

    public function handle(): int
    {
        Order::query()
            ->with(['items.variant', 'items.product'])
            ->where('status', 'pending_payment')
            ->whereNotNull('reservation_expires_at')
            ->where('reservation_expires_at', '<', now())
            ->chunkById(100, function ($orders): void {
                foreach ($orders as $order) {
                    DB::transaction(function () use ($order): void {
                        $locked = Order::query()
                            ->whereKey($order->id)
                            ->lockForUpdate()
                            ->first();

                        if (! $locked || $locked->status !== 'pending_payment') {
                            return;
                        }

                        $locked->load(['items.variant', 'items.product']);

                        foreach ($locked->items as $item) {
                            if ($item->variant) {
                                $variant = $item->variant()
                                    ->lockForUpdate()
                                    ->first();

                                if ($variant) {
                                    $variant->reserved_stock = max(
                                        0,
                                        $variant->reserved_stock - $item->quantity,
                                    );
                                    $variant->save();
                                }
                            } elseif ($item->product) {
                                $item->product()
                                    ->lockForUpdate()
                                    ->first()
                                    ?->increment('stock', $item->quantity);
                            }
                        }

                        $locked->update(['status' => 'cancelled']);
                    });
                }
            });

        return self::SUCCESS;
    }
}
