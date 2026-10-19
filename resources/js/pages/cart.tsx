import { Head, Link, router, useForm } from '@inertiajs/react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

export default function Cart({ cart }: any) {
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
                <header className="flex h-16 items-center justify-between bg-black px-8 text-white">
                    <Link href="/" className="font-black italic">
                        ZOMNTU
                    </Link>
                    <Link href="/shop" className="text-xs tracking-[.2em]">
                        CONTINUE SHOPPING
                    </Link>
                </header>
                <main className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_420px]">
                    <section>
                        <h1 className="text-2xl tracking-[.25em]">YOUR BAG</h1>
                        <div className="mt-8 space-y-4">
                            {cart.items.map((item: any) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between border-b border-black/10 pb-4"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {item.product.name}
                                        </p>
                                        <p className="text-sm text-black/50">
                                            Qty {item.quantity}
                                            {item.size
                                                ? ' · ' + item.size
                                                : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p>{money(item.line_total_cents)}</p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.delete(
                                                    '/cart/' +
                                                        encodeURIComponent(
                                                            item.key,
                                                        ),
                                                )
                                            }
                                            className="mt-2 text-xs underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <aside className="bg-white p-7 shadow-sm">
                        <h2 className="text-sm font-bold tracking-[.2em]">
                            CHECKOUT
                        </h2>
                        <p className="mt-5 flex justify-between">
                            <span>Subtotal</span>
                            <span>{money(cart.subtotal_cents)}</span>
                        </p>
                        <p className="mt-1 text-xs text-black/50">
                            Shipping calculated at checkout. Free over R1,000.
                        </p>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post('/checkout/payfast');
                            }}
                            className="mt-7 space-y-3"
                        >
                            {Object.keys(form.data).map((key) => (
                                <input
                                    key={key}
                                    value={(form.data as any)[key]}
                                    onChange={(event) =>
                                        form.setData(
                                            key as any,
                                            event.target.value,
                                        )
                                    }
                                    placeholder={key.replaceAll('_', ' ')}
                                    className="w-full border border-black/15 bg-transparent px-4 py-3 text-sm"
                                />
                            ))}
                            <button
                                disabled={form.processing || !cart.count}
                                className="w-full bg-black py-4 text-xs font-bold tracking-[.2em] text-white disabled:opacity-40"
                            >
                                PAY SECURELY WITH PAYFAST
                            </button>
                        </form>
                    </aside>
                </main>
            </div>
        </>
    );
}
