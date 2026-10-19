<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
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

            $variantIds = $cart->pluck('variant_id')->filter()->values();
            $variants = ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lines = [];

            foreach ($cart as $row) {
                $product = $products->get($row['product_id']);
                abort_unless($product && $product->is_active, 422, 'A product is no longer available.');

                $variant = isset($row['variant_id']) ? $variants->get($row['variant_id']) : null;

                if ($product->variants()->exists()) {
                    abort_unless(
                        $variant && $variant->product_id === $product->id && $variant->is_active,
                        422,
                        'A selected size is no longer available.'
                    );
                    abort_if($variant->availableStock() < $row['quantity'], 422, 'A selected size has sold out.');

                    $variant->increment('reserved_stock', $row['quantity']);
                    $unitPrice = $variant->price_cents ?? $product->price_cents;
                } else {
                    abort_if($product->stock < $row['quantity'], 422, 'A product has sold out.');

                    $product->decrement('stock', $row['quantity']);
                    $unitPrice = $product->price_cents;
                }

                $line = $unitPrice * $row['quantity'];
                $subtotal += $line;
                $lines[] = [$product, $variant, $row, $unitPrice, $line];
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
                'reservation_expires_at' => now()->addMinutes(45),
                ...collect($data)->except('coupon')->all(),
            ]);

            foreach ($lines as [$product, $variant, $row, $unitPrice, $line]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'name' => $product->name,
                    'sku' => $variant?->sku ?? $product->sku,
                    'size' => $variant?->size,
                    'colour' => $variant?->colour ?? $product->colour,
                    'unit_price_cents' => $unitPrice,
                    'quantity' => $row['quantity'],
                    'line_total_cents' => $line,
                ]);
            }

            return $order;
        });

        $gatewayContract = 'Vmt\\PayFast\\Contracts\\PaymentGateway';
        $checkoutRequestClass = 'Vmt\\PayFast\\Data\\CheckoutRequest';

        if (! interface_exists($gatewayContract) || ! class_exists($checkoutRequestClass)) {
            throw new RuntimeException('vmt/payfast is not installed. Follow docs/PAYMENTS.md before checkout.');
        }

        $gateway = app($gatewayContract);
        $checkoutRequest = new $checkoutRequestClass(
            reference: $order->reference,
            amountCents: $order->total_cents,
            itemName: 'ZOMNTU '.$order->reference,
            orderReference: $order->reference,
        );

        $checkout = $gateway->createCheckout($checkoutRequest);

        $request->session()->forget('cart');

        return response($checkout->toHtml())->header('Cache-Control', 'no-store');
    }
}
