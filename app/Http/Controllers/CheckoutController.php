<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Vmt\PayFast\Contracts\PaymentGateway;
use Vmt\PayFast\Data\CheckoutRequest;

class CheckoutController extends Controller
{
    public function __construct(private readonly PaymentGateway $payments) {}

    public function __invoke(Request $request): Response
    {
        /** @var array{shipping_name:string,shipping_phone?:string|null,shipping_address:string,shipping_city:string,shipping_province:string,shipping_postal_code?:string|null,coupon?:string|null} $data */
        $data = $request->validate([
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['nullable', 'string', 'max:50'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_province' => ['required', 'string', 'max:120'],
            'shipping_postal_code' => ['nullable', 'string', 'max:20'],
            'coupon' => ['nullable', 'string', 'max:64'],
        ]);

        /** @var array<string, array{product_id:int,variant_id:int|null,quantity:int}> $rawCart */
        $rawCart = $request->session()->get('cart', []);

        /** @var Collection<string, array{product_id:int,variant_id:int|null,quantity:int}> $cart */
        $cart = collect($rawCart);

        abort_if($cart->isEmpty(), 422, 'Your cart is empty.');

        $order = DB::transaction(function () use ($request, $data, $cart): Order {
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
            /** @var array<int, array{0:Product,1:ProductVariant|null,2:array{product_id:int,variant_id:int|null,quantity:int},3:int,4:int}> $lines */
            $lines = [];

            foreach ($cart as $row) {
                $productCandidate = $products->get($row['product_id']);

                abort_unless(
                    $productCandidate instanceof Product && $productCandidate->is_active,
                    422,
                    'A product is no longer available.',
                );

                $product = $productCandidate;
                $variantCandidate = $row['variant_id'] !== null
                    ? $variants->get($row['variant_id'])
                    : null;
                $variant = $variantCandidate instanceof ProductVariant
                    ? $variantCandidate
                    : null;

                if ($product->variants()->exists()) {
                    abort_unless(
                        $variant instanceof ProductVariant
                            && $variant->product_id === $product->id
                            && $variant->is_active,
                        422,
                        'A selected size is no longer available.',
                    );
                    abort_if(
                        $variant->availableStock() < $row['quantity'],
                        422,
                        'A selected size has sold out.',
                    );

                    $variant->increment('reserved_stock', $row['quantity']);
                    $unitPrice = $variant->price_cents ?? $product->price_cents;
                } else {
                    abort_if(
                        $product->stock < $row['quantity'],
                        422,
                        'A product has sold out.',
                    );

                    $product->decrement('stock', $row['quantity']);
                    $unitPrice = $product->price_cents;
                }

                $line = $unitPrice * $row['quantity'];
                $subtotal += $line;
                $lines[] = [$product, $variant, $row, $unitPrice, $line];
            }

            $coupon = filled($data['coupon'] ?? null)
                ? Coupon::query()
                    ->whereRaw('UPPER(code) = ?', [strtoupper((string) $data['coupon'])])
                    ->lockForUpdate()
                    ->first()
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
                ...Arr::except($data, ['coupon']),
            ]);

            foreach ($lines as [$product, $variant, $row, $unitPrice, $line]) {
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_variant_id' => $variant instanceof ProductVariant ? $variant->id : null,
                    'name' => $product->name,
                    'sku' => $variant instanceof ProductVariant ? $variant->sku : $product->sku,
                    'size' => $variant instanceof ProductVariant ? $variant->size : null,
                    'colour' => $variant instanceof ProductVariant ? $variant->colour : $product->colour,
                    'unit_price_cents' => $unitPrice,
                    'quantity' => $row['quantity'],
                    'line_total_cents' => $line,
                ]);
            }

            return $order;
        });

        $checkout = $this->payments->createCheckout(new CheckoutRequest(
            reference: $order->reference,
            amountCents: $order->total_cents,
            itemName: 'ZOMNTU '.$order->reference,
            orderReference: $order->reference,
        ));

        $order->update(['payment_transaction_id' => $checkout->reference]);
        $request->session()->forget('cart');

        return response($checkout->toHtml())
            ->header('Cache-Control', 'no-store');
    }
}
