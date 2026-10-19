<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('cart', ['cart' => $this->cartPayload($request)]);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->is_active, 404);

        $data = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'variant_id' => ['nullable', 'integer'],
        ]);

        $variant = null;

        if ($product->variants()->exists()) {
            $variant = ProductVariant::query()
                ->whereKey($data['variant_id'] ?? 0)
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->firstOrFail();

            abort_if($variant->availableStock() < 1, 422, 'This size is sold out.');
        } else {
            abort_if($product->stock < 1, 422, 'This product is sold out.');
        }

        $cart = $request->session()->get('cart', []);
        $key = $product->id.'|'.($variant?->id ?? 'base');
        $existing = $cart[$key] ?? [
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'quantity' => 0,
        ];

        $requested = $existing['quantity'] + ($data['quantity'] ?? 1);
        $available = $variant?->availableStock() ?? $product->stock;
        $existing['quantity'] = min(10, $available, $requested);
        $cart[$key] = $existing;

        $request->session()->put('cart', $cart);

        return back();
    }

    public function remove(Request $request, string $key): RedirectResponse
    {
        $cart = $request->session()->get('cart', []);
        unset($cart[$key]);
        $request->session()->put('cart', $cart);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $request->session()->forget('cart');

        return back();
    }

    public static function payload(Request $request): array
    {
        $rows = collect($request->session()->get('cart', []));
        $products = Product::query()
            ->with('images')
            ->whereIn('id', $rows->pluck('product_id'))
            ->get()
            ->keyBy('id');
        $variants = ProductVariant::query()
            ->whereIn('id', $rows->pluck('variant_id')->filter())
            ->get()
            ->keyBy('id');

        $items = $rows->map(function (array $row, string $key) use ($products, $variants) {
            $product = $products->get($row['product_id']);

            if (! $product) {
                return null;
            }

            $variant = isset($row['variant_id']) ? $variants->get($row['variant_id']) : null;
            $unitPrice = $variant?->price_cents ?? $product->price_cents;

            return [
                'key' => $key,
                'product' => $product,
                'variant' => $variant,
                'quantity' => $row['quantity'],
                'line_total_cents' => $unitPrice * $row['quantity'],
            ];
        })->filter()->values();

        return [
            'items' => $items,
            'subtotal_cents' => $items->sum('line_total_cents'),
            'count' => $items->sum('quantity'),
        ];
    }

    private function cartPayload(Request $request): array
    {
        return self::payload($request);
    }
}
