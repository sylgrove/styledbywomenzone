"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import { mapProductRow, type Product, type ProductRow } from "@/data/products";
import { createClient } from "@/utils/supabase/client";

export default function ShyamolPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("brand", "shyamol")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Shyamol products could not be loaded:", error.message);
        setProducts([]);
      } else {
        setProducts((data ?? []).map((row) => mapProductRow(row as ProductRow)));
      }

      setLoading(false);
    }

    loadProducts();
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#40382d]">
      <div className="bg-[#6f5a3f] px-4 py-2 text-center text-[10px] tracking-[2px] text-white">SHYAMOL · HANDCRAFTED WITH CHARACTER</div>
      <SiteHeader />
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24 lg:px-12">
        <div>
          <Image src="/logos/shyamol.png" alt="Shyamol logo" width={260} height={140} className="mb-8 h-24 w-auto object-contain object-left" />
          <p className="text-[10px] tracking-[3px] text-[#917b58]">HANDCRAFTED · DESIGNER · ARTISANAL</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight text-[#473b2d] sm:text-6xl">Made with meaning. <span className="italic text-[#917b58]">Made to be treasured.</span></h1>
          <p className="mt-7 max-w-xl text-sm leading-8 text-[#766b5d]">Shyamol is the handcrafted and designer collection within Styled By Womenzone, celebrating artistic details, thoughtful design and creative expression.</p>
          <p className="mt-5 border-l-2 border-[#b7a17b] pl-4 text-sm leading-7 text-[#766b5d]">
            {products.length > 0 ? "Explore our current handcrafted and designer collection below." : "We're preparing this collection. Products will appear here as soon as they are ready."}
          </p>
          <Link href="/" className="mt-8 inline-block bg-[#6f5a3f] px-7 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-[#8b7353]">EXPLORE ALL BRANDS</Link>
        </div>
        <div className="relative flex min-h-[360px] items-center justify-center border border-[#e4d9c7] bg-[#f0e9dc] p-10 md:min-h-[520px]">
          <div className="absolute inset-5 border border-[#c9b99e]" />
          <div className="relative text-center">
            <p className="text-[10px] tracking-[4px] text-[#917b58]">শ্যামল</p>
            <h2 className="mt-5 font-serif text-4xl text-[#554631]">The art of thoughtful living.</h2>
            <p className="mt-5 font-serif text-lg italic text-[#917b58]">{products.length > 0 ? "A collection made with care" : "Coming soon"}</p>
          </div>
        </div>
      </section>

      {(loading || products.length > 0) && (
        <section className="bg-[#f5f0e6] px-5 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-[10px] tracking-[3px] text-[#917b58]">SHOP THE COLLECTION</p>
            <h2 className="mt-3 font-serif text-4xl text-[#554631] sm:text-5xl">Shyamol</h2>
            <p className="mt-3 text-sm text-[#766b5d]">Handcrafted and designer pieces, selected with care.</p>

            {loading ? (
              <p className="mt-8 border border-dashed border-[#d8ccb7] bg-white px-5 py-12 text-center text-sm text-[#766b5d]">Loading the collection...</p>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <article key={product.id} className="group min-w-0">
                    <Link href={`/product/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-[#e9e0d3]">
                      <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                      {product.badge && <span className="absolute left-2 top-2 bg-white/95 px-3 py-2 text-[8px] tracking-wide text-[#725a54]">{product.badge}</span>}
                      {!product.available && <span className="absolute bottom-2 left-2 bg-black/75 px-3 py-2 text-[8px] tracking-[1.5px] text-white">OUT OF STOCK</span>}
                    </Link>
                    <div className="pt-4">
                      <p className="text-[9px] tracking-[1.5px] text-[#917b58]">{product.category.toUpperCase()}</p>
                      <Link href={`/product/${product.id}`} className="mt-2 block font-serif text-base leading-snug text-[#554631] hover:underline sm:text-xl">{product.name}</Link>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-[#6f5a3f]">৳{product.price.toLocaleString("en-BD")}</span>
                        {product.originalPrice && <span className="text-xs text-[#a99a9e] line-through">৳{product.originalPrice.toLocaleString("en-BD")}</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-[#e4d9c7] bg-white px-5 py-8 text-center">
        <p className="text-[10px] tracking-[2px] text-[#766b5d]">SHYAMOL · A BRAND BY STYLED BY WOMENZONE</p>
        <p className="mt-2 text-xs text-[#9a8d7d]">Made with care in Bangladesh.</p>
      </footer>
    </main>
  );
}
