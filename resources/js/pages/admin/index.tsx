import { Head, Link, router, useForm } from '@inertiajs/react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

function VariantForm({ productId }: { productId: number }) {
    const form = useForm({
        sku: '',
        size: '',
        colour: '',
        price: '',
        stock: '0',
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.post('/admin/products/' + productId + '/variants', {
                    preserveScroll: true,
                    onSuccess: () => form.reset(),
                });
            }}
            className="mt-4 grid gap-2 rounded border border-black/10 bg-[#faf9f6] p-3 sm:grid-cols-5"
        >
            {(['sku', 'size', 'colour', 'price', 'stock'] as const).map((key) => (
                <input
                    key={key}
                    value={form.data[key]}
                    onChange={(event) => form.setData(key, event.target.value)}
                    placeholder={key}
                    className="border border-black/15 bg-white px-3 py-2 text-xs"
                />
            ))}
            <button className="bg-black px-4 py-2 text-[10px] font-bold tracking-[.14em] text-white sm:col-span-5">
                ADD VARIANT
            </button>
        </form>
    );
}

function ProductEditor({ item }: { item: any }) {
    const form = useForm({
        name: item.name as string,
        category: item.category as string,
        price: (item.price_cents / 100).toFixed(2),
        stock: String(item.stock),
        is_active: Boolean(item.is_active),
        is_featured: Boolean(item.is_featured),
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.patch('/admin/products/' + item.id, {
                    preserveScroll: true,
                });
            }}
            className="mt-4 grid gap-2 border-t border-black/10 pt-4 sm:grid-cols-2"
        >
            <input
                value={form.data.name}
                onChange={(event) => form.setData('name', event.target.value)}
                className="border border-black/15 px-3 py-2 text-xs"
                aria-label="Product name"
            />
            <input
                value={form.data.category}
                onChange={(event) => form.setData('category', event.target.value)}
                className="border border-black/15 px-3 py-2 text-xs"
                aria-label="Category"
            />
            <input
                value={form.data.price}
                onChange={(event) => form.setData('price', event.target.value)}
                className="border border-black/15 px-3 py-2 text-xs"
                aria-label="Price"
            />
            <input
                value={form.data.stock}
                onChange={(event) => form.setData('stock', event.target.value)}
                className="border border-black/15 px-3 py-2 text-xs"
                aria-label="Base stock"
            />
            <label className="flex items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(event) =>
                        form.setData('is_active', event.target.checked)
                    }
                />
                Published
            </label>
            <label className="flex items-center gap-2 text-xs">
                <input
                    type="checkbox"
                    checked={form.data.is_featured}
                    onChange={(event) =>
                        form.setData('is_featured', event.target.checked)
                    }
                />
                Featured
            </label>
            <button className="bg-black px-4 py-2 text-[10px] font-bold tracking-[.14em] text-white sm:col-span-2">
                SAVE PRODUCT
            </button>
        </form>
    );
}

function OrderActions({ order }: { order: any }) {
    const form = useForm({
        status:
            order.status === 'paid'
                ? 'processing'
                : order.status === 'processing'
                  ? 'shipped'
                  : 'delivered',
        tracking_number: order.tracking_number ?? '',
    });

    if (!['paid', 'processing', 'shipped'].includes(order.status)) {
        return (
            <span className="text-[10px] uppercase tracking-[.12em] text-black/40">
                {order.status === 'payment_review'
                    ? 'Review required'
                    : 'No action'}
            </span>
        );
    }

    const label =
        order.status === 'paid'
            ? 'START PROCESSING'
            : order.status === 'processing'
              ? 'MARK SHIPPED'
              : 'MARK DELIVERED';

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.patch('/admin/orders/' + order.id, {
                    preserveScroll: true,
                });
            }}
            className="flex min-w-52 flex-col gap-2"
        >
            {order.status === 'processing' && (
                <input
                    value={form.data.tracking_number}
                    onChange={(event) =>
                        form.setData('tracking_number', event.target.value)
                    }
                    placeholder="Courier tracking number"
                    className="border border-black/15 px-3 py-2 text-xs"
                />
            )}
            <button className="bg-black px-3 py-2 text-[9px] font-bold tracking-[.12em] text-white">
                {label}
            </button>
        </form>
    );
}

export default function Admin({ products, coupons, orders }: any) {
    const product = useForm<{
        name: string;
        sku: string;
        category: string;
        description: string;
        price: string;
        gsm: string;
        colour: string;
        stock: string;
        is_featured: boolean;
        image: File | null;
    }>({
        name: '',
        sku: '',
        category: 'Tees',
        description: '',
        price: '',
        gsm: '240',
        colour: 'Black',
        stock: '0',
        is_featured: true,
        image: null,
    });

    const coupon = useForm({
        code: '',
        type: 'percent',
        value: '10',
        minimum: '0',
        usage_limit: '',
        ends_at: '',
    });

    return (
        <>
            <Head title="Admin — ZOMNTU" />
            <div className="min-h-screen bg-[#f3f0e9]">
                <header className="flex h-16 items-center justify-between bg-black px-6 text-white lg:px-8">
                    <Link href="/" className="font-black italic">
                        ZOMNTU ADMIN
                    </Link>
                    <div className="flex gap-6 text-xs tracking-[.18em]">
                        <Link href="/shop">STORE</Link>
                        <Link href="/account/orders">MY ORDERS</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
                    <section className="grid gap-6 md:grid-cols-3">
                        {[
                            ['PRODUCTS', products.length],
                            ['COUPONS', coupons.length],
                            ['ORDERS', orders.length],
                        ].map(([label, value]) => (
                            <div key={String(label)} className="bg-white p-6">
                                <p className="text-xs tracking-[.2em]">{label}</p>
                                <p className="mt-2 text-4xl font-semibold">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </section>

                    <section className="grid gap-8 lg:grid-cols-2">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                product.post('/admin/products', {
                                    forceFormData: true,
                                    onSuccess: () => product.reset(),
                                });
                            }}
                            className="bg-white p-6"
                        >
                            <h2 className="font-semibold tracking-[.18em]">
                                ADD PRODUCT
                            </h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {(
                                    [
                                        'name',
                                        'sku',
                                        'category',
                                        'price',
                                        'gsm',
                                        'colour',
                                        'stock',
                                    ] as const
                                ).map((key) => (
                                    <input
                                        key={key}
                                        value={product.data[key] as string}
                                        onChange={(event) =>
                                            product.setData(key, event.target.value)
                                        }
                                        placeholder={key.replaceAll('_', ' ')}
                                        className="border border-black/15 px-3 py-2 text-sm"
                                    />
                                ))}
                            </div>
                            <textarea
                                value={product.data.description}
                                onChange={(event) =>
                                    product.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                placeholder="description"
                                className="mt-3 min-h-24 w-full border border-black/15 p-3 text-sm"
                            />
                            <label className="mt-3 block text-xs font-semibold tracking-[.12em]">
                                PRODUCT IMAGE
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        product.setData(
                                            'image',
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="mt-2 block w-full text-sm"
                                />
                            </label>
                            <label className="mt-4 flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={product.data.is_featured}
                                    onChange={(event) =>
                                        product.setData(
                                            'is_featured',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Feature on homepage
                            </label>
                            <button className="mt-4 bg-black px-6 py-3 text-xs font-bold text-white">
                                CREATE PRODUCT
                            </button>
                        </form>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                coupon.post('/admin/coupons', {
                                    onSuccess: () => coupon.reset(),
                                });
                            }}
                            className="bg-white p-6"
                        >
                            <h2 className="font-semibold tracking-[.18em]">
                                CREATE COUPON
                            </h2>
                            <div className="mt-5 grid gap-3">
                                <input
                                    value={coupon.data.code}
                                    onChange={(event) =>
                                        coupon.setData('code', event.target.value)
                                    }
                                    placeholder="coupon code"
                                    className="border border-black/15 px-3 py-2 text-sm"
                                />
                                <select
                                    value={coupon.data.type}
                                    onChange={(event) =>
                                        coupon.setData('type', event.target.value)
                                    }
                                    className="border border-black/15 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="percent">Percentage</option>
                                    <option value="fixed">Fixed rand amount</option>
                                </select>
                                {(
                                    [
                                        'value',
                                        'minimum',
                                        'usage_limit',
                                        'ends_at',
                                    ] as const
                                ).map((key) => (
                                    <input
                                        key={key}
                                        value={coupon.data[key]}
                                        onChange={(event) =>
                                            coupon.setData(key, event.target.value)
                                        }
                                        placeholder={
                                            key === 'value'
                                                ? coupon.data.type === 'fixed'
                                                    ? 'discount value (R)'
                                                    : 'discount value (%)'
                                                : key.replaceAll('_', ' ')
                                        }
                                        className="border border-black/15 px-3 py-2 text-sm"
                                    />
                                ))}
                            </div>
                            <button className="mt-4 bg-black px-6 py-3 text-xs font-bold text-white">
                                CREATE COUPON
                            </button>
                        </form>
                    </section>

                    <section className="bg-white p-6">
                        <h2 className="font-semibold tracking-[.18em]">
                            CATALOGUE
                        </h2>
                        <p className="mt-2 text-xs text-black/50">
                            Publish, price and stock products here. Use variants for
                            sizes or colour-specific inventory.
                        </p>
                        <div className="mt-6 grid gap-5 lg:grid-cols-2">
                            {products.map((item: any) => (
                                <article
                                    key={item.id}
                                    className="border border-black/10 p-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="h-24 w-20 shrink-0 bg-[#eee8dd]">
                                            {item.image_url && (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-black/50">
                                                        {item.sku} · {item.category}
                                                    </p>
                                                </div>
                                                <p className="text-sm">
                                                    {money(item.price_cents)}
                                                </p>
                                            </div>
                                            <p className="mt-3 text-xs">
                                                {item.variants?.length
                                                    ? item.variants
                                                          .map(
                                                              (variant: any) =>
                                                                  (variant.size ??
                                                                      variant.colour) +
                                                                  ' (' +
                                                                  Math.max(
                                                                      0,
                                                                      variant.stock -
                                                                          variant.reserved_stock,
                                                                  ) +
                                                                  ')',
                                                          )
                                                          .join(' · ')
                                                    : 'Base stock: ' + item.stock}
                                            </p>
                                        </div>
                                    </div>
                                    <ProductEditor item={item} />
                                    <VariantForm productId={item.id} />
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-6">
                        <h2 className="font-semibold tracking-[.18em]">
                            ORDER FULFILMENT
                        </h2>
                        <p className="mt-2 text-xs text-black/50">
                            Payment status comes from verified PayFast events.
                            Administrators only move paid orders through fulfilment.
                        </p>
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3">Reference</th>
                                        <th>Customer</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Tracking</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-black/5 align-top"
                                        >
                                            <td className="py-4">{order.reference}</td>
                                            <td className="py-4">
                                                {order.user?.email ?? 'Deleted account'}
                                            </td>
                                            <td className="py-4">
                                                {money(order.total_cents)}
                                            </td>
                                            <td className="py-4 capitalize">
                                                {order.status.replaceAll('_', ' ')}
                                            </td>
                                            <td className="py-4">
                                                {order.tracking_number || '—'}
                                            </td>
                                            <td className="py-4">
                                                <OrderActions order={order} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
