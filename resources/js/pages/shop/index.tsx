import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

export default function Shop({ products, filters, categories }: any) {
    const [query, setQuery] = useState(filters.q ?? '');
    const page = usePage().props as any;

    const apply = (next: Record<string, string>) =>
        router.get(
            '/shop',
            {
                q: query,
                category: filters.category ?? '',
                sort: filters.sort ?? '',
                ...next,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Shop — ZOMNTU" />
            <div className="min-h-screen bg-[#f8f6f0]">
                <header className="flex h-16 items-center justify-between bg-black px-6 text-white lg:px-10">
                    <Link href="/" className="text-2xl font-black italic">
                        ZOMNTU
                    </Link>
                    <div className="flex gap-8 text-xs tracking-[.2em]">
                        <Link href="/">HOME</Link>
                        <Link href="/cart" className="flex items-center gap-2">
                            <ShoppingBag size={16} />
                            {page.cart?.count ?? 0}
                        </Link>
                    </div>
                </header>

                <main className="px-6 py-10 lg:px-10">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-[.25em]">
                                SHOP
                            </h1>
                            <p className="mt-2 text-sm text-black/50">
                                Premium African streetwear, 220–360 GSM.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="flex items-center border border-black/15 bg-white px-3">
                                <Search size={15} className="text-black/40" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') apply({ q: query });
                                    }}
                                    placeholder="Search"
                                    className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                                />
                            </label>
                            <select
                                value={filters.category ?? ''}
                                onChange={(event) =>
                                    apply({ category: event.target.value })
                                }
                                className="border border-black/15 bg-white px-3 py-3 text-sm"
                            >
                                <option value="">All categories</option>
                                {categories.map((category: string) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.sort ?? ''}
                                onChange={(event) =>
                                    apply({ sort: event.target.value })
                                }
                                className="border border-black/15 bg-white px-3 py-3 text-sm"
                            >
                                <option value="">Newest</option>
                                <option value="price-asc">Price: low to high</option>
                                <option value="price-desc">Price: high to low</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                        {products.data.map((product: any) => (
                            <article key={product.id} className="group">
                                <Link href={'/shop/' + product.slug}>
                                    <div className="aspect-[4/5] overflow-hidden bg-[#e9e3d8]">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-center text-5xl">
                                                ☥
                                                <br />
                                                ◉
                                                <br />△
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="mt-3 flex justify-between gap-4">
                                    <div>
                                        <Link
                                            href={'/shop/' + product.slug}
                                            className="text-sm font-semibold"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="mt-1 text-xs text-black/50">
                                            {product.gsm
                                                ? product.gsm + ' GSM · '
                                                : ''}
                                            {product.colour}
                                        </p>
                                    </div>
                                    <span className="text-sm">
                                        {money(product.price_cents)}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>

                    {products.links?.length > 3 && (
                        <div className="mt-12 flex flex-wrap gap-2">
                            {products.links.map((link: any, index: number) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveScroll: true,
                                        })
                                    }
                                    className={
                                        'border px-4 py-2 text-xs ' +
                                        (link.active
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/15')
                                    }
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
