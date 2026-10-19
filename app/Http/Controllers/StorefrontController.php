<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome', [
            'featured' => Product::query()
                ->with(['variants', 'images'])
                ->where('is_active', true)
                ->where('is_featured', true)
                ->latest()
                ->take(6)
                ->get(),
        ]);
    }

    public function shop(Request $request): Response
    {
        $query = Product::query()
            ->with(['variants', 'images'])
            ->where('is_active', true);

        if ($search = trim((string) $request->string('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category = trim((string) $request->string('category'))) {
            $query->where('category', $category);
        }

        match ($request->string('sort')->toString()) {
            'price-asc' => $query->orderBy('price_cents'),
            'price-desc' => $query->orderByDesc('price_cents'),
            'oldest' => $query->oldest(),
            default => $query->latest(),
        };

        return Inertia::render('shop/index', [
            'products' => $query->paginate(18)->withQueryString(),
            'filters' => $request->only(['q', 'category', 'sort']),
            'categories' => Product::query()
                ->where('is_active', true)
                ->distinct()
                ->orderBy('category')
                ->pluck('category'),
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load([
            'variants' => fn ($query) => $query->where('is_active', true),
            'images',
        ]);

        return Inertia::render('shop/show', [
            'product' => $product,
            'related' => Product::query()
                ->where('is_active', true)
                ->where('category', $product->category)
                ->whereKeyNot($product->id)
                ->take(4)
                ->get(),
        ]);
    }
}
