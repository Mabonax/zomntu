import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Admin({ products, coupons, orders }: any) {
    const product = useForm({
        name: '',
        sku: '',
        category: 'Tees',
        description: '',
        price: '',
        gsm: '240',
        colour: 'Black',
        image_url: '',
        stock: '0',
        is_featured: true,
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
                <header className="flex h-16 items-center justify-between bg-black px-8 text-white">
                    <Link href="/" className="font-black italic">
                        ZOMNTU ADMIN
                    </Link>
                    <Link
                        href="/account/orders"
                        className="text-xs tracking-[.2em]"
                    >
                        STORE VIEW
                    </Link>
                </header>
                <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
                    <section className="grid gap-6 md:grid-cols-3">
                        <div className="bg-white p-6">
                            <p className="text-xs tracking-[.2em]">PRODUCTS</p>
                            <p className="mt-2 text-4xl font-semibold">
                                {products.length}
                            </p>
                        </div>
                        <div className="bg-white p-6">
                            <p className="text-xs tracking-[.2em]">COUPONS</p>
                            <p className="mt-2 text-4xl font-semibold">
                                {coupons.length}
                            </p>
                        </div>
                        <div className="bg-white p-6">
                            <p className="text-xs tracking-[.2em]">ORDERS</p>
                            <p className="mt-2 text-4xl font-semibold">
                                {orders.length}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-8 lg:grid-cols-2">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                product.post('/admin/products', {
                                    onSuccess: () => product.reset(),
                                });
                            }}
                            className="bg-white p-6"
                        >
                            <h2 className="font-semibold tracking-[.18em]">
                                ADD PRODUCT
                            </h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {Object.keys(product.data)
                                    .filter(
                                        (key) =>
                                            ![
                                                'description',
                                                'is_featured',
                                            ].includes(key),
                                    )
                                    .map((key) => (
                                        <input
                                            key={key}
                                            value={(product.data as any)[key]}
                                            onChange={(event) =>
                                                product.setData(
                                                    key as any,
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={key.replaceAll(
                                                '_',
                                                ' ',
                                            )}
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
                            <label className="mt-3 flex items-center gap-2 text-sm">
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
                                {Object.keys(coupon.data).map((key) => (
                                    <input
                                        key={key}
                                        value={(coupon.data as any)[key]}
                                        onChange={(event) =>
                                            coupon.setData(
                                                key as any,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={key.replaceAll('_', ' ')}
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
                            ORDERS
                        </h2>
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3">Reference</th>
                                        <th>Customer</th>
                                        <th>Status</th>
                                        <th>Tracking</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-black/5"
                                        >
                                            <td className="py-3">
                                                {order.reference}
                                            </td>
                                            <td>{order.user?.email}</td>
                                            <td>{order.status}</td>
                                            <td>
                                                {order.tracking_number || '—'}
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.patch(
                                                            '/admin/orders/' +
                                                                order.id,
                                                            {
                                                                status: 'processing',
                                                            },
                                                        )
                                                    }
                                                    className="text-xs underline"
                                                >
                                                    Mark processing
                                                </button>
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
