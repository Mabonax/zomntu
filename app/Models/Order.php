<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'reference', 'status', 'subtotal_cents', 'discount_cents',
        'shipping_cents', 'total_cents', 'coupon_code', 'payment_transaction_id',
        'shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city',
        'shipping_province', 'shipping_postal_code', 'tracking_number',
        'paid_at', 'shipped_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return ['paid_at' => 'datetime', 'shipped_at' => 'datetime', 'delivered_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
}
