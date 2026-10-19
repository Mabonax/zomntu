import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { LockKeyhole, ShoppingBag } from 'lucide-react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

const fields = [
    ['shipping_name', 'Full name', 'text'],
    ['shipping_phone', 'Phone number', 'tel'],
    ['shipping_address', 'Street address', 'text'],
    ['shipping_city', 'City', 'text'],
    ['shipping_province', 'Province', 'text'],
    ['shipping_postal_code', 'Postal code', 'text'],
    ['coupon', 'Coupon code', 'text'],
] as const;

export default function Cart({ cart }: any) {
    const page = usePage().props as any;
    const signedIn = Boolean(page.auth?.user);
    const form = useForm({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_province: 'Gauteng',
        shipping_postal_code: '',
        coupon: '',
    });

    return (
        <>
            <Head title="Bag — ZOMNTU" />
            <div className="min-h-screen bg-[#f8f6f0]">
                <header className="flex h-16 items-center justify-between bg-black px-6 text-white lg:px-8">
                    <Link href="/" className="font-black italic">
                        ZOMNTU
                    </Link>
                    <Link href="/shop" className="text-xs tracking-[.2em]">
                        CONTINUE SHOPPING
                    </Link>
                </header>

                <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_420px]">
                    <section>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl tracking-[.25em]">
                                YOUR BAG
                            </h1>
                            <span className="text-xs text-black/50">
                                {cart.count} {cart.count === 1 ? 'item' : 'items'}
                            </span>
                        </div>

                        {cart.items.length === 0 ? (
                            <div className="mt-10 border border-black/10 bg-white px-6 py-16 text-center">
                                <ShoppingBag
                                    className="mx-auto text-black/30"
                                    size={34}
                                />
                                <p className="mt-5 font-semibold">
                                    Your bag is empty.
                                </p>
                                <p className="mt-2 text-sm text-black/50">
                                    Explore the latest ZOMNTU drop and add a piece.
                                </p>
                                <Link
                                    href="/shop"
                                    className="mt-7 inline-block bg-black px-7 py-3 text-[10px] font-bold tracking-[.16em] text-white"
                                >
                                    SHOP COLLECTION
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-8 space-y-5">
                                {cart.items.map((item: any) => (
                                    <div
                                        key={item.key}
                                        className="grid grid-cols-[88px_1fr_auto] gap-4 border-b border-black/10 pb-5"
                                    >
                                        <div className="aspect-[4/5] overflow-hidden bg-[#ebe5da]">
                                            {item.product.image_url ? (
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-2xl">
                                                    ☥
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {item.product.name}
                                            </p>
                                            <p className="mt-1 text-sm text-black/50">
                                                {item.variant?.size &&
                                                    'Size ' + item.variant.size}
                                                {item.variant?.colour &&
                                                    ' · ' + item.variant.colour}
                                            </p>
                                            <p className="mt-1 text-xs text-black/40">
                                                Quantity {item.quantity}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    router.delete(
                                                        '/cart/' +
                                                            encodeURIComponent(
                                                                item.key,
                                                            ),
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                className="mt-4 text-xs underline underline-offset-4"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="font-medium">
                                            {money(item.line_total_cents)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="h-fit bg-white p-7 shadow-sm lg:sticky lg:top-8">
                        <h2 className="text-sm font-bold tracking-[.2em]">
                            ORDER SUMMARY
                        </h2>
                        <div className="mt-5 space-y-2 border-b border-black/10 pb-5 text-sm">
                            <p className="flex justify-between">
                                <span className="text-black/55">Subtotal</span>
                                <span>{money(cart.subtotal_cents)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-black/55">Delivery</span>
                                <span>
                                    {cart.subtotal_cents >= 100000
                                        ? 'Free'
                                        : 'R 99'}
                                </span>
                            </p>
                        </div>
                        <p className="mt-4 text-xs leading-5 text-black/50">
                            Free nationwide delivery on orders of R1,000 or more.
                            Final discount is validated securely on the server.
                        </p>

                        {!signedIn ? (
                            <div className="mt-7">
                                <Link
                                    href="/login"
                                    className="block w-full bg-black py-4 text-center text-xs font-bold tracking-[.2em] text-white"
                                >
                                    SIGN IN TO CHECK OUT
                                </Link>
                                <p className="mt-3 text-center text-xs text-black/45">
                                    Your bag stays in this browser while you sign in.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post('/checkout/payfast');
                                }}
                                className="mt-7 space-y-4"
                            >
                                <p className="text-[10px] font-bold tracking-[.2em]">
                                    DELIVERY DETAILS
                                </p>
                                {fields.map(([key, label, type]) => (
                                    <label
                                        key={key}
                                        className="block text-xs font-medium"
                                    >
                                        {label}
                                        <input
                                            type={type}
                                            value={form.data[key]}
                                            onChange={(event) =>
                                                form.setData(
                                                    key,
                                                    event.target.value,
                                                )
                                            }
                                            autoComplete={
                                                key === 'shipping_name'
                                                    ? 'name'
                                                    : key === 'shipping_phone'
                                                      ? 'tel'
                                                      : key ===
                                                          'shipping_postal_code'
                                                        ? 'postal-code'
                                                        : undefined
                                            }
                                            className="mt-1.5 w-full border border-black/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-black"
                                        />
                                        {form.errors[key] && (
                                            <span className="mt-1 block text-[11px] text-red-600">
                                                {form.errors[key]}
                                            </span>
                                        )}
                                    </label>
                                ))}
                                <button
                                    disabled={form.processing || !cart.count}
                                    className="flex w-full items-center justify-center gap-2 bg-black py-4 text-xs font-bold tracking-[.18em] text-white disabled:opacity-40"
                                >
                                    <LockKeyhole size={14} />
                                    {form.processing
                                        ? 'PREPARING PAYMENT…'
                                        : 'PAY SECURELY WITH PAYFAST'}
                                </button>
                            </form>
                        )}
                    </aside>
                </main>
            </div>
        </>
    );
}
