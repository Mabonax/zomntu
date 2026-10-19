<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'sku', 'category', 'description', 'price_cents',
        'compare_at_price_cents', 'gsm', 'colour', 'image_url',
        'is_featured', 'is_active', 'stock',
    ];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'is_active' => 'boolean'];
    }
}
