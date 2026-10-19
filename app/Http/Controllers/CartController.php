<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('cart', ['cart' => self::payload($request)]);
    }

    public function add(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->is_active, 404);

        /** @var array{quantity?:int,variant_id?:int|null} $data */
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

        /** @var array<string, array{product_id:int,variant_id:int|null,quantity:int}> $cart */
        $cart = $request->session()->get('cart', []);
        $variantKey = $variant instanceof ProductVariant ? (string) $variant->id : 'base';
        $key = $product->id.'|'.$variantKey;
        $existing = $cart[$key] ?? [
            'product_id' => $product->id,
            'variant_id' => $variant instanceof ProductVariant ? $variant->id : null,
            'quantity' => 0,
        ];

        $requested = $existing['quantity'] + ($data['quantity'] ?? 1);
        $available = $variant instanceof ProductVariant
            ? $variant->availableStock()
            : $product->stock;
        $existing['quantity'] = min(10, $available, $requested);
        $cart[$key] = $existing;

        $request->session()->put('cart', $cart);

        return back();
    }

    public function remove(Request $request, string $key): RedirectResponse
    {
        /** @var array<string, array{product_id:int,variant_id:int|null,quantity:int}> $cart */
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

    /**
     * @return array{
     *     items: Collection<int, array{
     *         key:string,
     *         product:Product,
     *         variant:ProductVariant|null,
     *         quantity:int,
     *         line_total_cents:int
     *     }>,
     *     subtotal_cents:int,
     *     count:int
     * }
     */
    public static function payload(Request $request): array
    {
        /** @var array<string, array{product_id:int,variant_id:int|null,quantity:int}> $rawCart */
        $rawCart = $request->session()->get('cart', []);

        /** @var Collection<string, array{product_id:int,variant_id:int|null,quantity:int}> $rows */
        $rows = collect($rawCart);

        $products = Product::query()
            ->with('images')
            ->whereIn('id', $rows->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $variants = ProductVariant::query()
            ->whereIn('id', $rows->pluck('variant_id')->filter())
            ->get()
            ->keyBy('id');

        $items = $rows->map(function (array $row, string $key) use ($products, $variants): ?array {
            $product = $products->get($row['product_id']);

            if (! $product instanceof Product) {
                return null;
            }

            $variant = $row['variant_id'] !== null
                ? $variants->get($row['variant_id'])
                : null;
            $typedVariant = $variant instanceof ProductVariant ? $variant : null;
            $unitPrice = $typedVariant instanceof ProductVariant
                ? ($typedVariant->price_cents ?? $product->price_cents)
                : $product->price_cents;

            return [
                'key' => $key,
                'product' => $product,
                'variant' => $typedVariant,
                'quantity' => $row['quantity'],
                'line_total_cents' => $unitPrice * $row['quantity'],
            ];
        })->filter()->values();

        /** @var Collection<int, array{key:string,product:Product,variant:ProductVariant|null,quantity:int,line_total_cents:int}> $items */
        return [
            'items' => $items,
            'subtotal_cents' => (int) $items->sum('line_total_cents'),
            'count' => (int) $items->sum('quantity'),
        ];
    }
}
