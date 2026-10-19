<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/index', [
            'products' => Product::latest()->take(100)->get(),
            'coupons' => Coupon::latest()->take(100)->get(),
            'orders' => Order::with('user')->latest()->take(100)->get(),
        ]);
    }

    public function storeProduct(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:80', 'unique:products,sku'],
            'category' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'gsm' => ['nullable', 'integer', 'min:100', 'max:600'],
            'colour' => ['nullable', 'string', 'max:80'],
            'image_url' => ['nullable', 'url', 'max:1000'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_featured' => ['boolean'],
        ]);

        Product::create([
            ...collect($data)->except('price')->all(),
            'slug' => Str::slug($data['name']).'-'.strtolower(Str::random(5)),
            'price_cents' => (int) round($data['price'] * 100),
        ]);

        return back();
    }

    public function updateProduct(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:80'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $product->update([
            ...collect($data)->except('price')->all(),
            'price_cents' => (int) round($data['price'] * 100),
        ]);

        return back();
    }

    public function storeCoupon(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:64', 'unique:coupons,code'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'integer', 'min:1'],
            'minimum' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'ends_at' => ['nullable', 'date'],
        ]);

        Coupon::create([
            ...collect($data)->except('minimum')->all(),
            'code' => strtoupper($data['code']),
            'minimum_cents' => (int) round(($data['minimum'] ?? 0) * 100),
        ]);

        return back();
    }

    public function updateOrder(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:paid,processing,shipped,delivered,cancelled'],
            'tracking_number' => ['nullable', 'string', 'max:150'],
        ]);

        $order->update([
            ...$data,
            'shipped_at' => $data['status'] === 'shipped' ? now() : $order->shipped_at,
            'delivered_at' => $data['status'] === 'delivered' ? now() : $order->delivered_at,
        ]);

        return back();
    }
}
