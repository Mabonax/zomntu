import { Head, Link } from '@inertiajs/react';
import { Check, PackageCheck, Truck } from 'lucide-react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

const stages = ['paid', 'processing', 'shipped', 'delivered'];

function progress(status: string) {
    const index = stages.indexOf(status);
    return index < 0 ? 0 : index + 1;
}

export default function Orders({ orders }: any) {
    return (
        <>
            <Head title="My Orders — ZOMNTU" />
            <div className="min-h-screen bg-[#f8f6f0]">
                <header className="flex h-16 items-center justify-between bg-black px-6 text-white lg:px-8">
                    <Link href="/" className="font-black italic">
                        ZOMNTU
                    </Link>
                    <div className="flex gap-7 text-xs tracking-[.18em]">
                        <Link href="/shop">SHOP</Link>
                        <Link href="/settings/profile">PROFILE</Link>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-6 py-12">
                    <p className="text-[10px] font-semibold tracking-[.3em] text-black/45">
                        YOUR ACCOUNT
                    </p>
                    <h1 className="mt-2 text-3xl tracking-[.2em]">
                        MY ORDERS
                    </h1>

                    {orders.data.length === 0 ? (
                        <div className="mt-10 border border-black/10 bg-white py-16 text-center">
                            <PackageCheck
                                size={36}
                                className="mx-auto text-black/25"
                            />
                            <p className="mt-5 font-semibold">
                                No orders yet.
                            </p>
                            <p className="mt-2 text-sm text-black/50">
                                Your purchases and tracking updates will appear here.
                            </p>
                            <Link
                                href="/shop"
                                className="mt-7 inline-block bg-black px-7 py-3 text-[10px] font-bold tracking-[.16em] text-white"
                            >
                                SHOP ZOMNTU
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-8 space-y-5">
                            {orders.data.map((order: any) => {
                                const completed = progress(order.status);

                                return (
                                    <article
                                        key={order.id}
                                        className="border border-black/10 bg-white p-6"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">
                                                    {order.reference}
                                                </p>
                                                <p className="mt-1 text-xs uppercase tracking-[.15em] text-black/50">
                                                    {order.status.replaceAll(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {money(order.total_cents)}
                                                </p>
                                                <p className="mt-1 text-xs text-black/50">
                                                    {order.tracking_number
                                                        ? 'Tracking: ' +
                                                          order.tracking_number
                                                        : order.status ===
                                                            'shipped'
                                                          ? 'Tracking is being updated'
                                                          : 'Tracking appears after dispatch'}
                                                </p>
                                            </div>
                                        </div>

                                        {stages.includes(order.status) && (
                                            <div className="mt-7 grid grid-cols-4 gap-2">
                                                {stages.map((stage, index) => {
                                                    const active =
                                                        index < completed;
                                                    return (
                                                        <div key={stage}>
                                                            <div className="flex items-center">
                                                                <span
                                                                    className={
                                                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ' +
                                                                        (active
                                                                            ? 'border-black bg-black text-white'
                                                                            : 'border-black/20 text-black/25')
                                                                    }
                                                                >
                                                                    {stage ===
                                                                    'shipped' ? (
                                                                        <Truck
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                    ) : active ? (
                                                                        <Check
                                                                            size={
                                                                                13
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        index +
                                                                        1
                                                                    )}
                                                                </span>
                                                                {index < 3 && (
                                                                    <span
                                                                        className={
                                                                            'h-px flex-1 ' +
                                                                            (index <
                                                                            completed -
                                                                                1
                                                                                ? 'bg-black'
                                                                                : 'bg-black/15')
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-[9px] font-semibold uppercase tracking-[.08em] text-black/55">
                                                                {stage}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {order.status === 'payment_review' && (
                                            <p className="mt-6 border border-amber-300 bg-amber-50 p-3 text-xs leading-5">
                                                Payment was received after stock
                                                availability changed. This order
                                                needs administrator review before
                                                fulfilment.
                                            </p>
                                        )}

                                        <div className="mt-6 border-t border-black/10 pt-4">
                                            {order.items.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between gap-4 py-1 text-xs"
                                                >
                                                    <span>
                                                        {item.quantity} ×{' '}
                                                        {item.name}
                                                        {item.size
                                                            ? ' · ' + item.size
                                                            : ''}
                                                    </span>
                                                    <span>
                                                        {money(
                                                            item.line_total_cents,
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
