<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome', [
            'featured' => Product::query()
                ->where('is_active', true)
                ->where('is_featured', true)
                ->latest()
                ->take(6)
                ->get(),
        ]);
    }

    public function shop(): Response
    {
        return Inertia::render('shop/index', [
            'products' => Product::query()
                ->where('is_active', true)
                ->latest()
                ->paginate(18)
                ->withQueryString(),
        ]);
    }
}
