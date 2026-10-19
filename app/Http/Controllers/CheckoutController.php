<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['nullable', 'string', 'max:50'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_province' => ['required', 'string', 'max:120'],
            'shipping_postal_code' => ['nullable', 'string', 'max:20'],
            'coupon' => ['nullable', 'string', 'max:64'],
        ]);

        $cart = collect($request->session()->get('cart', []));
        abort_if($cart->isEmpty(), 422, 'Your cart is empty.');

        $order = DB::transaction(function () use ($request, $data, $cart) {
            $products = Product::query()
                ->whereIn('id', $cart->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lines = [];

            foreach ($cart as $row) {
                $product = $products->get($row['product_id']);

                abort_unless(
                    $product && $product->is_active && $product->stock >= $row['quantity'],
                    422,
                    'A product is no longer available.'
                );

                $line = $product->price_cents * $row['quantity'];
                $subtotal += $line;
                $lines[] = [$product, $row, $line];
            }

            $coupon = filled($data['coupon'] ?? null)
                ? Coupon::query()->whereRaw('UPPER(code) = ?', [strtoupper($data['coupon'])])->first()
                : null;

            $discount = $coupon?->discountFor($subtotal) ?? 0;
            $shipping = $subtotal - $discount >= 100000 ? 0 : 9900;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'reference' => 'ZMT-'.now()->format('ymd').'-'.strtoupper(Str::random(7)),
                'subtotal_cents' => $subtotal,
                'discount_cents' => $discount,
                'shipping_cents' => $shipping,
                'total_cents' => $subtotal - $discount + $shipping,
                'coupon_code' => $coupon?->code,
                ...collect($data)->except('coupon')->all(),
            ]);

            foreach ($lines as [$product, $row, $line]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'size' => $row['size'] ?? null,
                    'colour' => $product->colour,
                    'unit_price_cents' => $product->price_cents,
                    'quantity' => $row['quantity'],
                    'line_total_cents' => $line,
                ]);
            }

            return $order;
        });

        if (! interface_exists(\Vmt\PayFast\Contracts\PaymentGateway::class)) {
            throw new RuntimeException('vmt/payfast is not installed. Follow docs/PAYMENTS.md before checkout.');
        }

        $gateway = app(\Vmt\PayFast\Contracts\PaymentGateway::class);
        $checkout = $gateway->createCheckout(new \Vmt\PayFast\Data\CheckoutRequest(
            reference: $order->reference,
            amountCents: $order->total_cents,
            itemName: 'ZOMNTU '.$order->reference,
            orderReference: $order->reference,
        ));

        $request->session()->forget('cart');

        return response($checkout->toHtml())
            ->header('Cache-Control', 'no-store');
    }
}
