<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $sku
 * @property string $category
 * @property string|null $description
 * @property int $price_cents
 * @property int|null $compare_at_price_cents
 * @property int|null $gsm
 * @property string|null $colour
 * @property string|null $image_url
 * @property bool $is_featured
 * @property bool $is_active
 * @property int $stock
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read Collection<int, ProductImage> $images
 */
class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'sku',
        'category',
        'description',
        'price_cents',
        'compare_at_price_cents',
        'gsm',
        'colour',
        'image_url',
        'is_featured',
        'is_active',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /** @return HasMany<ProductVariant, $this> */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /** @return HasMany<ProductImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /** @return HasMany<ProductVariant, $this> */
    public function activeVariants(): HasMany
    {
        return $this->variants()->where('is_active', true);
    }

    public function availableStock(): int
    {
        if ($this->relationLoaded('variants') && $this->variants->isNotEmpty()) {
            return (int) $this->variants->sum(
                fn (ProductVariant $variant): int => $variant->availableStock()
            );
        }

        return $this->stock;
    }
}
