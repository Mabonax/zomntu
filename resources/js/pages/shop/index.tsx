import { Head, Link, router } from '@inertiajs/react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

export default function Shop({ products }: any) {
    return (
        <>
            <Head title="Shop — ZOMNTU" />
            <div className="min-h-screen bg-[#f8f6f0]">
                <header className="flex h-16 items-center justify-between bg-black px-8 text-white">
                    <Link href="/" className="text-2xl font-black italic">
                        ZOMNTU
                    </Link>
                    <div className="flex gap-8 text-xs tracking-[.2em]">
                        <Link href="/">HOME</Link>
                        <Link href="/cart">BAG</Link>
                    </div>
                </header>
                <main className="px-6 py-12 lg:px-12">
                    <h1 className="text-3xl font-semibold tracking-[.25em]">
                        SHOP
                    </h1>
                    <p className="mt-2 text-sm text-black/50">
                        Premium African streetwear, 220–360 GSM.
                    </p>
                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {products.data.map((product: any) => (
                            <article key={product.id}>
                                <div className="aspect-[4/5] bg-[#e9e3d8] p-8">
                                    <div className="flex h-full items-center justify-center border border-black/10 text-center text-5xl">
                                        ☥
                                        <br />
                                        ◉
                                        <br />△
                                    </div>
                                </div>
                                <h2 className="mt-3 text-sm font-semibold">
                                    {product.name}
                                </h2>
                                <p className="mt-1 text-xs text-black/50">
                                    {product.gsm
                                        ? product.gsm + ' GSM · '
                                        : ''}
                                    {product.colour}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span>{money(product.price_cents)}</span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.post('/cart/' + product.id, {
                                                quantity: 1,
                                            })
                                        }
                                        className="bg-black px-4 py-2 text-[10px] font-bold text-white"
                                    >
                                        ADD
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
