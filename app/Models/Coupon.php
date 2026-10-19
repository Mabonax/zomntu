<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property string $type
 * @property int $value
 * @property int $minimum_cents
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int|null $usage_limit
 * @property int $uses
 * @property bool $is_active
 */
class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'minimum_cents',
        'starts_at',
        'ends_at',
        'usage_limit',
        'uses',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function discountFor(int $subtotal): int
    {
        if (! $this->is_active || $subtotal < $this->minimum_cents) {
            return 0;
        }

        $now = Carbon::now();

        if (($this->starts_at && $this->starts_at->isAfter($now))
            || ($this->ends_at && $this->ends_at->isBefore($now))
            || ($this->usage_limit !== null && $this->uses >= $this->usage_limit)) {
            return 0;
        }

        return $this->type === 'percent'
            ? min($subtotal, (int) floor($subtotal * ($this->value / 100)))
            : min($subtotal, $this->value);
    }
}
