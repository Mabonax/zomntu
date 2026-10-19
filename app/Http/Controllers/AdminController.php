<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/index', [
            'products' => Product::with(['variants', 'images'])->latest()->take(100)->get(),
            'coupons' => Coupon::latest()->take(100)->get(),
            'orders' => Order::with('user')->latest()->take(100)->get(),
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        /** @var array{name:string,sku:string,category:string,description?:string|null,price:numeric-string|int|float,gsm?:int|null,colour?:string|null,stock:int,is_featured?:bool,image?:mixed} $data */
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:80', 'unique:products,sku'],
            'category' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'gsm' => ['nullable', 'integer', 'min:100', 'max:600'],
            'colour' => ['nullable', 'string', 'max:80'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_featured' => ['boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $product = Product::create([
            ...Arr::except($data, ['price', 'image']),
            'slug' => Str::slug($data['name']).'-'.strtolower(Str::random(5)),
            'price_cents' => (int) round((float) $data['price'] * 100),
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');

            if ($file === null) {
                throw new RuntimeException('Uploaded product image was not available.');
            }

            $path = $file->store('products', 'public');

            if (! is_string($path)) {
                throw new RuntimeException('Unable to store product image.');
            }

            $url = Storage::disk('public')->url($path);

            $product->images()->create([
                'path' => $url,
                'alt' => $product->name,
                'position' => 0,
            ]);

            $product->update(['image_url' => $url]);
        }

        return back();
    }

    public function storeVariant(Request $request, Product $product): RedirectResponse
    {
        /** @var array{sku:string,size?:string|null,colour?:string|null,price?:numeric-string|int|float|null,stock:int} $data */
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:80', 'unique:product_variants,sku'],
            'size' => ['nullable', 'string', 'max:40'],
            'colour' => ['nullable', 'string', 'max:80'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $product->variants()->create([
            ...Arr::except($data, ['price']),
            'price_cents' => isset($data['price'])
                ? (int) round((float) $data['price'] * 100)
                : null,
        ]);

        return back();
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        /** @var array{name:string,category:string,price:numeric-string|int|float,stock:int,is_active?:bool,is_featured?:bool} $data */
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:80'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $product->update([
            ...Arr::except($data, ['price']),
            'price_cents' => (int) round((float) $data['price'] * 100),
        ]);

        return back();
    }

    public function storeCoupon(Request $request): RedirectResponse
    {
        /** @var array{code:string,type:string,value:int,minimum?:numeric-string|int|float|null,usage_limit?:int|null,ends_at?:string|null} $data */
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', 'unique:coupons,code'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'integer', 'min:1'],
            'minimum' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'ends_at' => ['nullable', 'date'],
        ]);

        Coupon::create([
            ...Arr::except($data, ['minimum']),
            'code' => strtoupper($data['code']),
            'minimum_cents' => (int) round((float) ($data['minimum'] ?? 0) * 100),
        ]);

        return back();
    }

    public function updateOrder(Request $request, Order $order): RedirectResponse
    {
        /** @var array{status:string,tracking_number?:string|null} $data */
        $data = $request->validate([
            'status' => ['required', 'in:processing,shipped,delivered'],
            'tracking_number' => ['nullable', 'string', 'max:150'],
        ]);

        $allowedTransitions = [
            'paid' => ['processing'],
            'processing' => ['shipped'],
            'shipped' => ['delivered'],
        ];

        abort_unless(
            in_array($data['status'], $allowedTransitions[$order->status] ?? [], true),
            422,
            'Invalid order status transition.',
        );

        if ($data['status'] === 'shipped') {
            abort_if(blank($data['tracking_number'] ?? null), 422, 'A tracking number is required before shipping.');
        }

        $order->update([
            ...$data,
            'tracking_number' => $data['tracking_number'] ?? $order->tracking_number,
            'shipped_at' => $data['status'] === 'shipped' ? now() : $order->shipped_at,
            'delivered_at' => $data['status'] === 'delivered' ? now() : $order->delivered_at,
        ]);

        return back();
    }
}
