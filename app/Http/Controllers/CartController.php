<?php

namespace App\Http\Controllers;

use App\Models\Product;
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
        abort_unless($product->is_active && $product->stock > 0, 404);

        $data = $request->validate([
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'size' => ['nullable', 'string', 'max:20'],
        ]);

        $cart = $request->session()->get('cart', []);
        $key = $product->id.'|'.($data['size'] ?? '');
        $existing = $cart[$key] ?? [
            'product_id' => $product->id,
            'quantity' => 0,
            'size' => $data['size'] ?? null,
        ];

        $existing['quantity'] = min(10, $existing['quantity'] + ($data['quantity'] ?? 1));
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

    private function cartPayload(Request $request): array
    {
        $rows = collect($request->session()->get('cart', []));
        $products = Product::query()
            ->whereIn('id', $rows->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $items = $rows->map(function (array $row, string $key) use ($products) {
            $product = $products->get($row['product_id']);

            if (! $product) {
                return null;
            }

            return [
                'key' => $key,
                'product' => $product,
                'quantity' => $row['quantity'],
                'size' => $row['size'],
                'line_total_cents' => $product->price_cents * $row['quantity'],
            ];
        })->filter()->values();

        return [
            'items' => $items,
            'subtotal_cents' => $items->sum('line_total_cents'),
            'count' => $items->sum('quantity'),
        ];
    }
}
