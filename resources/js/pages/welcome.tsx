import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart, Search, ShoppingBag, UserRound } from 'lucide-react';

type Product = {
    id: number;
    slug: string;
    name: string;
    category: string;
    price_cents: number;
    colour?: string | null;
    gsm?: number | null;
    image_url?: string | null;
};

const money = (cents: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0,
    }).format(cents / 100);

function GlyphArt({ dark = false }: { dark?: boolean }) {
    const glyphs = ['☥', '◉', '△', '≋', '𓂀', '✦', '▽', '◌', '☥', '△', '◉', '≋', '✦', '☥', '▽'];

    return (
        <div
            className={
                'relative flex h-full min-h-64 items-center justify-center overflow-hidden ' +
                (dark ? 'bg-zinc-950 text-[#d0a347]' : 'bg-[#f4efe4] text-black')
            }
        >
            <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(90deg,transparent_48%,currentColor_49%,currentColor_51%,transparent_52%)] [background-size:85px_100%]" />
            <div className="relative grid grid-cols-3 gap-x-7 gap-y-3 text-center text-2xl font-semibold tracking-widest">
                {glyphs.map((glyph, index) => (
                    <span key={index}>{glyph}</span>
                ))}
            </div>
        </div>
    );
}

export default function Welcome({ featured = [] }: { featured?: Product[] }) {
    const page = usePage().props as any;
    const { auth } = page;

    return (
        <>
            <Head title="ZOMNTU — African Roots, Modern Expression" />
            <div className="min-h-screen bg-[#f8f6f0] text-[#111]">
                <header className="sticky top-0 z-50 flex h-16 items-center justify-between bg-black px-6 text-white lg:px-14">
                    <Link href="/" className="text-2xl font-black italic tracking-[-0.12em]">
                        ZOMNTU<span className="text-red-600">_</span>
                    </Link>
                    <nav className="hidden gap-10 text-[11px] font-semibold tracking-[0.18em] md:flex">
                        <Link href="/">HOME</Link>
                        <Link href="/shop">SHOP</Link>
                        <a href="#collections">COLLECTIONS</a>
                        <a href="#lookbook">LOOKBOOK</a>
                        <a href="#about">ABOUT</a>
                    </nav>
                    <div className="flex items-center gap-5">
                        <Link href="/shop">
                            <Search size={19} />
                        </Link>
                        <Link href={auth?.user ? '/account/orders' : '/login'}>
                            <UserRound size={19} />
                        </Link>
                        <Link href="/cart" className="relative">
                            <ShoppingBag size={19} />
                            {(page.cart?.count ?? 0) > 0 && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-[#c89c43] px-1 text-[9px] text-black">
                                    {page.cart.count}
                                </span>
                            )}
                        </Link>
                    </div>
                </header>

                <section className="grid min-h-[620px] bg-[#d8c7ad] lg:grid-cols-[35%_65%]">
                    <div className="flex flex-col justify-center px-8 py-16 lg:px-20">
                        <p className="mb-6 text-[10px] font-bold tracking-[0.38em]">
                            AFRICAN ROOTS • MODERN EXPRESSION
                        </p>
                        <h1 className="text-7xl font-black italic leading-[0.85] tracking-[-0.08em] lg:text-8xl">
                            ZOMNTU
                        </h1>
                        <div className="mt-2 h-2 w-56 -rotate-2 bg-red-600" />
                        <p className="mt-7 text-sm font-semibold tracking-[0.35em]">
                            WEAR YOUR STORY
                        </p>
                        <p className="mt-5 max-w-sm text-sm leading-6">
                            Contemporary African streetwear inspired by heritage,
                            culture and the people who move what’s next.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <Link
                                href="/shop"
                                className="bg-black px-7 py-4 text-[10px] font-bold tracking-[0.16em] text-white"
                            >
                                SHOP COLLECTIONS →
                            </Link>
                            <a
                                href="#about"
                                className="border border-black/50 px-7 py-4 text-[10px] font-bold tracking-[0.16em]"
                            >
                                OUR STORY
                            </a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="relative overflow-hidden bg-[#efe4d4] p-7">
                            <GlyphArt />
                            <div className="absolute bottom-10 left-10 text-5xl font-black">
                                HIERO
                                <br />
                                GLYPH
                            </div>
                        </div>
                        <div className="relative overflow-hidden bg-[#111] p-7 text-white">
                            <GlyphArt dark />
                            <div className="absolute bottom-12 right-8 text-right text-[11px] tracking-[0.4em]">
                                PEOPLE
                                <br />
                                CULTURE
                                <br />
                                TOMORROW
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-2 bg-black text-white md:grid-cols-4">
                    {[
                        ['NATIONWIDE DELIVERY', 'Across South Africa'],
                        ['EASY RETURNS', 'Hassle free'],
                        ['SECURE PAYMENTS', 'PayFast checkout'],
                        ['PREMIUM QUALITY', '220–360 GSM'],
                    ].map(([title, sub]) => (
                        <div key={title} className="border-white/15 px-7 py-5 md:border-r">
                            <p className="text-[10px] font-bold tracking-[0.22em]">{title}</p>
                            <p className="mt-1 text-xs text-white/60">{sub}</p>
                        </div>
                    ))}
                </section>

                <section id="collections" className="px-5 py-10 lg:px-10">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-xl font-semibold tracking-[0.32em]">
                            FEATURED COLLECTION
                        </h2>
                        <Link href="/shop" className="text-[10px] font-bold tracking-[0.2em]">
                            VIEW ALL →
                        </Link>
                    </div>
                    {featured.length ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                            {featured.slice(0, 6).map((product, index) => (
                                <article key={product.id} className="group">
                                    <Link
                                        href={'/shop/' + product.slug}
                                        className="relative block aspect-[4/5] overflow-hidden bg-[#ece8df]"
                                    >
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <GlyphArt dark={index === 1 || index === 3 || index === 5} />
                                        )}
                                        <span className="absolute right-3 top-3">
                                            <Heart size={18} />
                                        </span>
                                    </Link>
                                    <p className="mt-3 text-[10px] font-bold tracking-[0.16em]">
                                        {product.name.toUpperCase()}
                                    </p>
                                    <p className="mt-2 text-sm">{money(product.price_cents)}</p>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-black/10 bg-white px-6 py-14 text-center">
                            <p className="text-sm font-semibold tracking-[.18em]">
                                THE FIRST DROP IS BEING PREPARED
                            </p>
                            <p className="mt-3 text-sm text-black/50">
                                Add products from the administrator workspace to publish them here.
                            </p>
                        </div>
                    )}
                </section>

                <section id="lookbook" className="grid gap-2 px-5 pb-10 lg:grid-cols-2 lg:px-10">
                    <div className="relative min-h-72 overflow-hidden bg-[#2b1f17] text-white">
                        <GlyphArt dark />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/25">
                            <p className="text-[10px] tracking-[0.35em]">FOUNDER'S EDITION</p>
                            <h3 className="mt-3 text-4xl tracking-[0.3em]">THE ORIGIN</h3>
                            <Link href="/shop" className="mt-6 bg-white px-10 py-4 text-[10px] font-bold tracking-[0.16em] text-black">
                                SHOP NOW →
                            </Link>
                        </div>
                    </div>
                    <div className="relative min-h-72 overflow-hidden bg-[#2b1f17] text-white">
                        <GlyphArt dark />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                            <p className="text-[10px] tracking-[0.35em]">NEW DROP</p>
                            <h3 className="mt-3 text-4xl tracking-[0.28em]">HIEROGLYPH</h3>
                            <p className="mt-3 text-[10px] tracking-[0.28em]">
                                A MODERN LANGUAGE. A BOLDER TOMORROW.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="about" className="bg-[#111] px-8 py-16 text-white lg:px-20">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <p className="text-[10px] tracking-[0.32em] text-[#d2a84f]">ZOMNTU</p>
                            <h3 className="mt-4 text-4xl font-semibold">
                                People. Culture. Tomorrow.
                            </h3>
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-white/70">
                            ZOMNTU is a South African streetwear label translating African
                            visual language into contemporary garments, from clean essentials
                            to expressive art pieces.
                        </p>
                    </div>
                </section>

                <footer className="bg-black px-8 py-10 text-xs text-white/60 lg:px-20">
                    <div className="flex flex-wrap justify-between gap-8">
                        <span className="font-black italic text-white">ZOMNTU</span>
                        <span>SHOP · COLLECTIONS · LOOKBOOK · ABOUT</span>
                        <span>© 2026 ZOMNTU</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
