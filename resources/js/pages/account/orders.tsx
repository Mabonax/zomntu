import { Head, Link } from '@inertiajs/react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

export default function Orders({ orders }: any) {
    return (
        <>
            <Head title="My Orders — ZOMNTU" />
            <div className="min-h-screen bg-[#f8f6f0]">
                <header className="flex h-16 items-center justify-between bg-black px-8 text-white">
                    <Link href="/" className="font-black italic">
                        ZOMNTU
                    </Link>
                    <Link href="/shop" className="text-xs tracking-[.2em]">
                        SHOP
                    </Link>
                </header>
                <main className="mx-auto max-w-5xl px-6 py-12">
                    <h1 className="text-3xl tracking-[.2em]">MY ORDERS</h1>
                    <div className="mt-8 space-y-5">
                        {orders.data.map((order: any) => (
                            <article
                                key={order.id}
                                className="border border-black/10 bg-white p-6"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">
                                            {order.reference}
                                        </p>
                                        <p className="mt-1 text-xs uppercase tracking-[.15em] text-black/50">
                                            {order.status.replaceAll('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p>{money(order.total_cents)}</p>
                                        <p className="text-xs text-black/50">
                                            {order.tracking_number
                                                ? 'Tracking: ' +
                                                  order.tracking_number
                                                : 'Tracking will appear once shipped'}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
