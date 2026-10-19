import { Head, Link, router, usePage } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

export default function ProductShow({ product, related }: any) {
    const variants = product.variants ?? [];
    const [variantId, setVariantId] = useState<number | null>(
        variants.find((variant: any) => variant.stock - variant.reserved_stock > 0)?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);
    const page = usePage().props as any;
    const cartCount = page.cart?.count ?? 0;

    const selected = useMemo(
        () => variants.find((variant: any) => variant.id === variantId),
        [variants, variantId],
    );

    const price = selected?.price_cents ?? product.price_cents;
    const available = selected
        ? Math.max(0, selected.stock - selected.reserved_stock)
        : product.stock;

    const addToBag = () =>
        router.post(
            '/cart/' + product.id,
            { quantity, variant_id: variantId },
            { preserveScroll: true },
        );

    return (
        <>
            <Head title={product.name + ' — ZOMNTU'} />
            <div className="min-h-screen bg-[#f8f6f0] text-[#111]">
                <header className="flex h-16 items-center justify-between bg-black px-6 text-white lg:px-12">
                    <Link href="/" className="text-2xl font-black italic">
                        ZOMNTU
                    </Link>
                    <div className="flex items-center gap-7 text-xs tracking-[.18em]">
                        <Link href="/shop">SHOP</Link>
                        <Link href="/cart" className="flex items-center gap-2">
                            <ShoppingBag size={17} />
                            {cartCount}
                        </Link>
                    </div>
                </header>

                <main className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.15fr_.85fr] lg:px-10">
                    <section className="grid gap-4 sm:grid-cols-2">
                        {(product.images?.length ? product.images : [{ path: product.image_url }]).map(
                            (image: any, index: number) => (
                                <div
                                    key={index}
                                    className="aspect-[4/5] overflow-hidden bg-[#e9e3d8]"
                                >
                                    {image?.path ? (
                                        <img
                                            src={image.path}
                                            alt={image.alt ?? product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-7xl">
                                            ☥
                                            <span className="mx-4">◉</span>
                                            𓂀
                                        </div>
                                    )}
                                </div>
                            ),
                        )}
                    </section>

                    <section className="lg:sticky lg:top-24 lg:self-start">
                        <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-black/45">
                            {product.category}
                        </p>
                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                            {product.name}
                        </h1>
                        <p className="mt-4 text-2xl">{money(price)}</p>
                        <p className="mt-6 max-w-xl text-sm leading-7 text-black/65">
                            {product.description}
                        </p>

                        {variants.length > 0 && (
                            <div className="mt-8">
                                <p className="text-xs font-bold tracking-[.18em]">SIZE</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {variants.map((variant: any) => {
                                        const stock = Math.max(
                                            0,
                                            variant.stock - variant.reserved_stock,
                                        );
                                        return (
                                            <button
                                                type="button"
                                                key={variant.id}
                                                disabled={stock === 0}
                                                onClick={() => setVariantId(variant.id)}
                                                className={
                                                    'min-w-14 border px-4 py-3 text-xs font-semibold ' +
                                                    (variantId === variant.id
                                                        ? 'border-black bg-black text-white'
                                                        : 'border-black/20 bg-transparent') +
                                                    (stock === 0
                                                        ? ' cursor-not-allowed opacity-25'
                                                        : '')
                                                }
                                            >
                                                {variant.size ?? variant.colour}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <p className="text-xs font-bold tracking-[.18em]">
                                QUANTITY
                            </p>
                            <div className="mt-3 inline-flex items-center border border-black/20">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="min-w-10 text-center text-sm">
                                    {quantity}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity(
                                            Math.min(
                                                Math.max(1, available),
                                                quantity + 1,
                                            ),
                                        )
                                    }
                                    className="p-3"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            disabled={available < 1 || (variants.length > 0 && !variantId)}
                            onClick={addToBag}
                            className="mt-8 w-full bg-black py-4 text-xs font-bold tracking-[.2em] text-white disabled:opacity-35"
                        >
                            {available > 0 ? 'ADD TO BAG' : 'SOLD OUT'}
                        </button>

                        <div className="mt-8 grid grid-cols-2 gap-4 border-y border-black/10 py-5 text-[11px]">
                            <div>
                                <p className="font-bold">PREMIUM WEIGHT</p>
                                <p className="mt-1 text-black/50">
                                    {product.gsm ? product.gsm + ' GSM' : 'Premium construction'}
                                </p>
                            </div>
                            <div>
                                <p className="font-bold">DELIVERY</p>
                                <p className="mt-1 text-black/50">
                                    Nationwide South Africa
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                {related?.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-10">
                        <h2 className="text-sm font-bold tracking-[.25em]">
                            YOU MAY ALSO LIKE
                        </h2>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {related.map((item: any) => (
                                <Link key={item.id} href={'/shop/' + item.slug}>
                                    <div className="aspect-[4/5] bg-[#e9e3d8]">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-5xl">
                                                ☥ ◉
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-3 text-sm font-semibold">
                                        {item.name}
                                    </p>
                                    <p className="mt-1 text-sm">
                                        {money(item.price_cents)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
