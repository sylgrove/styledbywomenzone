"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mapProductRow, type Product, type ProductBrand, type ProductRow } from "@/data/products";
import SiteHeader from "@/components/site-header";
import { createClient } from "@/utils/supabase/client";

export type BrandConfig = {
  brand: ProductBrand;
  name: string;
  categoryLabel: string;
  logo: string;
  announcement: string;
  eyebrow: string;
  headline: string;
  intro: string;
  storyHeading: string;
  story: string;
  pageBackground: string;
  heroBackground: string;
  accent: string;
  button: string;
  cardBackground: string;
};

export default function BrandStorefront({ config }: { config: BrandConfig }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("featured");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setLoadError("");

      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("brand", config.brand)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Brand products could not be loaded:", error.message);
        setLoadError("We couldn't load this collection. Please refresh the page.");
        setProducts([]);
      } else {
        setProducts((data ?? []).map((row) => mapProductRow(row as ProductRow)));
      }

      setLoading(false);
    }

    loadProducts();
    return () => { active = false; };
  }, [config.brand]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const filtered = products.filter(
      (product) => activeCategory === "All" || product.category === activeCategory,
    );

    return [...filtered].sort((a, b) => {
      if (sortOrder === "price-low") return a.price - b.price;
      if (sortOrder === "price-high") return b.price - a.price;
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [activeCategory, products, sortOrder]);

  const heroProduct = products.find((product) => product.available) ?? products[0];

  return (
    <main className={`min-h-screen ${config.pageBackground} text-[#332b28]`}>
      <div className={`${config.accent} px-4 py-2 text-center text-[10px] tracking-[2px] text-white sm:text-xs`}>
        {config.announcement}
      </div>
      <SiteHeader />

      <section className={`${config.heroBackground} overflow-hidden`}>
        <div className="mx-auto grid max-w-7xl items-center md:grid-cols-2">
          <div className="px-6 py-16 sm:px-10 md:py-24 lg:px-16">
            <Image src={config.logo} alt={`${config.name} logo`} width={190} height={90} className="mb-8 h-16 w-auto object-contain object-left" />
            <p className="mb-5 text-[10px] tracking-[3px] text-[#9b7770]">{config.eyebrow}</p>
            <h1 className="max-w-xl font-serif text-5xl leading-[1.12] text-[#403431] sm:text-6xl lg:text-7xl">{config.headline}</h1>
            <p className="mt-6 max-w-lg text-sm leading-8 text-[#766b65]">{config.intro}</p>
            <a href="#collection" className={`mt-8 inline-flex px-7 py-4 text-[10px] tracking-[2px] text-white transition hover:opacity-85 ${config.button}`}>EXPLORE COLLECTION</a>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[480px] md:min-h-[620px]">
            {heroProduct ? (
              <Image src={heroProduct.image} alt={heroProduct.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            ) : (
              <div className="flex min-h-[340px] h-full items-center justify-center bg-[#e9e0d3] p-10 sm:min-h-[480px]">
                <Image src={config.logo} alt={config.name} width={300} height={180} className="h-auto max-h-48 w-auto object-contain" />
              </div>
            )}
            <div className="absolute bottom-5 left-5 bg-white/90 px-5 py-4 backdrop-blur-sm sm:bottom-8 sm:left-8">
              <p className="text-[9px] tracking-[2px] text-[#96786d]">THE {config.name.toUpperCase()} EDIT</p>
              <p className="mt-1 font-serif text-xl text-[#493638]">Selected with care.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 text-center sm:px-8 sm:py-20">
        <p className="text-[10px] tracking-[3px] text-[#9b7770]">DISCOVER {config.name.toUpperCase()}</p>
        <h2 className="mt-4 font-serif text-4xl text-[#433532] sm:text-5xl">A collection that feels like you.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#786e68]">{config.intro}</p>
      </section>

      <section id="collection" className={`${config.cardBackground} px-5 py-14 sm:px-8 sm:py-20`}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] tracking-[3px] text-[#9b7770]">SHOP THE COLLECTION</p>
              <h2 className="mt-3 font-serif text-4xl text-[#433532] sm:text-5xl">{config.name}</h2>
              <p className="mt-3 text-sm text-[#786e68]">Browse the pieces currently available.</p>
            </div>
            <label className="flex items-center gap-3 text-xs text-[#776a64]">
              Sort by
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="border border-[#d9cbc2] bg-white px-3 py-2 outline-none focus:border-[#9b7770]">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`border px-4 py-2.5 text-xs transition ${activeCategory === category ? `${config.button} border-transparent text-white` : "border-[#d9cbc2] bg-white text-[#6f625c] hover:border-[#a9897d]"}`}>
                {category}
              </button>
            ))}
          </div>

          <div className="mb-5 flex items-center justify-between text-xs text-[#887a73]">
            <span>{loading ? "Loading products..." : `${visibleProducts.length} product${visibleProducts.length === 1 ? "" : "s"}`}</span>
            {activeCategory !== "All" && <button type="button" onClick={() => setActiveCategory("All")} className="underline underline-offset-4">Clear filter</button>}
          </div>

          {loadError ? (
            <p role="alert" className="border border-red-200 bg-white px-5 py-8 text-center text-sm text-red-700">{loadError}</p>
          ) : loading ? (
            <p className="border border-dashed border-[#d9cbc2] bg-white px-5 py-16 text-center text-sm text-[#887a73]">Loading the collection...</p>
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => <ProductCard key={product.id} product={product} config={config} />)}
            </div>
          ) : (
            <p className="border border-dashed border-[#d9cbc2] bg-white px-5 py-16 text-center text-sm text-[#887a73]">No products are listed in this collection yet.</p>
          )}
        </div>
      </section>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Image src={config.logo} alt={`${config.name} logo`} width={180} height={90} className="mx-auto h-16 w-auto object-contain" />
          <p className="mt-8 text-[10px] tracking-[3px] text-[#9b7770]">OUR STORY</p>
          <h2 className="mt-4 font-serif text-4xl text-[#433532] sm:text-5xl">{config.storyHeading}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#786e68]">{config.story}</p>
          <Link href="/" className="mt-8 inline-block border-b border-[#a9897d] pb-2 text-[10px] tracking-[2px] text-[#6f625c]">BACK TO STYLED BY WOMENZONE</Link>
        </div>
      </section>

      <footer className="border-t border-[#e9e0d9] bg-white px-5 py-8 text-center">
        <p className="text-[10px] tracking-[2px] text-[#766b65]">{config.name.toUpperCase()} · A BRAND BY STYLED BY WOMENZONE</p>
        <p className="mt-2 text-xs text-[#9a8d86]">Made with care in Bangladesh.</p>
      </footer>
    </main>
  );
}

function ProductCard({ product, config }: { product: Product; config: BrandConfig }) {
  return (
    <article className="group min-w-0">
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#eee7e2]">
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
        {product.badge && <span className="absolute left-2 top-2 bg-white/95 px-2 py-2 text-[8px] tracking-wide text-[#725a54] sm:left-3 sm:top-3 sm:px-3">{product.badge}</span>}
        {!product.available && <span className="absolute bottom-2 left-2 bg-black/75 px-3 py-2 text-[8px] tracking-[1.5px] text-white">OUT OF STOCK</span>}
      </Link>
      <div className="pt-4">
        <p className="text-[8px] tracking-[1.5px] text-[#9b7770] sm:text-[9px]">{product.category.toUpperCase()}</p>
        <Link href={`/product/${product.id}`} className="mt-2 block font-serif text-base leading-snug text-[#433532] hover:underline sm:text-xl">{product.name}</Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-[#493638]">৳{product.price.toLocaleString("en-BD")}</span>
          {product.originalPrice && <span className="text-xs text-[#a99a9e] line-through">৳{product.originalPrice.toLocaleString("en-BD")}</span>}
        </div>
        <Link href={`/product/${product.id}`} className={`mt-4 block px-3 py-3 text-center text-[9px] tracking-[1.5px] text-white transition hover:opacity-85 ${config.button}`}>
          VIEW PRODUCT DETAILS
        </Link>
      </div>
    </article>
  );
}
