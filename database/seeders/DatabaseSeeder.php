<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['Hieroglyph Tee', 'ZMT-TEE-HIER-001', 'Tees', 54900, 240, 'Bone', true, 30],
            ['Icon Tee', 'ZMT-TEE-ICON-001', 'Tees', 49900, 240, 'Black', true, 30],
            ['All Over Hieroglyph Tee', 'ZMT-TEE-ALL-001', 'Tees', 59900, 260, 'Bone', true, 24],
            ['Signature Hoodie', 'ZMT-HOOD-SIG-001', 'Hoodies', 109900, 320, 'Black', true, 20],
            ['Hieroglyph Hoodie', 'ZMT-HOOD-HIER-001', 'Hoodies', 119900, 320, 'Bone', true, 20],
            ['Icon Cap', 'ZMT-CAP-ICON-001', 'Accessories', 34900, null, 'Black', true, 30],
        ];

        foreach ($products as [$name, $sku, $category, $price, $gsm, $colour, $featured, $stock]) {
            Product::query()->updateOrCreate(
                ['sku' => $sku],
                [
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'category' => $category,
                    'description' => 'ZOMNTU premium streetwear.',
                    'price_cents' => $price,
                    'gsm' => $gsm,
                    'colour' => $colour,
                    'is_featured' => $featured,
                    'is_active' => true,
                    'stock' => $stock,
                ],
            );
        }
    }
}
