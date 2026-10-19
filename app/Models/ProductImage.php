<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property string $path
 * @property string|null $alt
 * @property int $position
 * @property-read Product $product
 */
class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'alt', 'position'];

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
