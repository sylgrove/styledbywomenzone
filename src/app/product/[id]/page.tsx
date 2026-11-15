"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProductById, getProductsByBrand } from "@/data/products";
import SiteHeader from "@/components/site-header";
import { readCart, writeCart } from "@/lib/cart";

const brandNames = {
  "jahans-thread": "Jahan's Thread",
  womenzone: "WomenZone",
  "pretty-finds": "Pretty Finds",
  shyamol: "Shyamol",
} as const;

const brandLinks = {
  "jahans-thread": "/jahans-thread",
  womenzone: "/womenzone",
  "pretty-finds": "/pretty-finds",
  shyamol: "/shyamol",
} as const;

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const product = getProductById(params.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [added, setAdded] = useState(false);
  const [optionError, setOptionError] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getProductsByBrand(product.brand)
      .filter((item) => item.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#fffdfa] text-[#403331]">
        <SiteHeader />
        <div className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] tracking-[3px] text-[#a17b72]">STYLED BY WOMENZONE</p>
          <h1 className="mt-4 font-serif text-4xl">Product not found</h1>
          <p className="mt-4 text-sm text-[#806d75]">This product may have been moved or is no longer available.</p>
          <Link href="/" className="mt-7 bg-[#493638] px-7 py-4 text-xs tracking-widest text-white">BACK TO SHOP</Link>
        </div>
      </main>
    );
  }

  const options = product.options ?? product.sizeOptions ?? [];
  const needsOption = options.length > 0;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  function addToCart() {
    if (needsOption && !selectedOption) {
      setOptionError(true);
      return;
    }

    const cart = readCart();
    const existingItem = cart.find(
      (item) => item.productId === product.id && item.selectedOption === selectedOption,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      writeCart([...cart]);
    } else {
      writeCart([...cart, { productId: product.id, quantity, selectedOption }]);
    }

    setOptionError(false);
    setAdded(true);
  }

  return (
    <main className="min-h-screen bg-[#fffdfa] text-[#3d3035]">
      <div className="bg-[#493638] px-4 py-2 text-center text-[10px] tracking-[2px] text-white">DISCOVER SOMETHING BEAUTIFUL</div>
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-5 py-6 text-xs text-[#9b858e]">
        <Link href="/" className="hover:text-[#956578]">Home</Link>
        <span className="mx-2">/</span>
        <Link href={brandLinks[product.brand]} className="hover:text-[#956578]">{brandNames[product.brand]}</Link>
        <span className="mx-2">/</span>
        <span className="text-[#563c48]">{product.name}</span>
      </div>

      <section className="mx-auto grid max-w-7xl gap-9 px-5 pb-16 md:grid-cols-2 md:gap-14 lg:px-10">
        <div className="relative aspect-[4/5] max-h-[760px] overflow-hidden bg-[#f4eeea]">
          <button type="button" onClick={() => setImageZoomOpen(true)} aria-label={`View larger image of ${product.name}`} className="absolute inset-0 h-full w-full cursor-zoom-in">
            <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </button>
          {product.badge && <span className="pointer-events-none absolute left-4 top-4 bg-white/95 px-4 py-3 text-[9px] tracking-[1.5px] text-[#765966]">{product.badge}</span>}
          <span className="pointer-events-none absolute bottom-4 right-4 bg-white/90 px-3 py-2 text-[9px] tracking-wide text-[#765966]">CLICK TO ZOOM</span>
        </div>

        <div className="flex flex-col justify-center py-2 md:py-10">
          <p className="text-[10px] tracking-[3px] text-[#a16f72]">{brandNames[product.brand].toUpperCase()}</p>
          <p className="mt-5 text-[10px] tracking-[2px] text-[#9b858e]">{product.category.toUpperCase()}</p>
          <h1 className="mt-3 font-serif text-3xl leading-snug text-[#563c48] sm:text-4xl lg:text-5xl">{product.name}</h1>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-medium text-[#89566b]">৳{product.price.toLocaleString("en-BD")}</span>
            {product.originalPrice && <>
              <span className="text-base text-[#a99a9e] line-through">৳{product.originalPrice.toLocaleString("en-BD")}</span>
              <span className="bg-[#f8e9ed] px-3 py-1.5 text-[9px] tracking-wide text-[#a96980]">SAVE {discount}%</span>
            </>}
          </div>

          <div className="my-7 border-t border-[#eee1e4]" />
          <h2 className="text-[10px] font-semibold tracking-[2px] text-[#704758]">PRODUCT DETAILS</h2>
          <p className="mt-4 max-w-lg text-sm leading-8 text-[#806d75]">{product.description}</p>

          {needsOption && <div className="mt-8">
            <p className="mb-4 text-[10px] tracking-[2px] text-[#704758]">SELECT AN OPTION <span className="text-[#a96980]">*</span></p>
            <div className="flex flex-wrap gap-3">
              {options.map((option) => (
                <button key={option} type="button" onClick={() => { setSelectedOption(option); setOptionError(false); setAdded(false); }} className={`border px-5 py-3 text-xs transition ${selectedOption === option ? "border-[#a96980] bg-[#a96980] text-white" : "border-[#e5cdd4] text-[#765966] hover:border-[#a96980]"}`}>
                  {option}
                </button>
              ))}
            </div>
            {optionError && <p role="alert" className="mt-3 text-xs text-red-700">Please select an option before adding this product to your bag.</p>}
          </div>}

          <div className="mt-8">
            <p className="mb-4 text-[10px] tracking-[2px] text-[#704758]">QUANTITY</p>
            <div className="inline-flex items-center border border-[#e5cdd4]">
              <button type="button" onClick={() => { setQuantity(Math.max(1, quantity - 1)); setAdded(false); }} className="px-5 py-3 text-lg text-[#89566b]" aria-label="Decrease quantity">−</button>
              <span className="min-w-10 text-center text-sm" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => { setQuantity(quantity + 1); setAdded(false); }} className="px-5 py-3 text-lg text-[#89566b]" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button type="button" onClick={addToCart} className="mt-8 w-full bg-[#493638] px-8 py-5 text-[10px] tracking-[2px] text-white transition hover:bg-[#76575a]">
            ADD TO BAG · ৳{(product.price * quantity).toLocaleString("en-BD")}
          </button>

          {added && <div className="mt-4 border border-[#d8e4d2] bg-[#f5faf2] p-4">
            <p className="text-sm font-medium text-[#496b43]">Added to your shopping bag.</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <Link href="/cart" className="font-semibold text-[#496b43] underline underline-offset-4">VIEW BAG & CHECKOUT</Link>
              <button type="button" onClick={() => setAdded(false)} className="text-[#6d625d] underline underline-offset-4">Continue browsing</button>
            </div>
          </div>}

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-[#eee1e4] pt-6 text-xs text-[#806d75]">
            <p>✓ Secure order details at checkout</p>
            <p>✓ Cash on Delivery available</p>
          </div>
          <p className="mt-5 text-[10px] tracking-wide text-[#9b858e]">A BRAND BY STYLED BY WOMENZONE · BANGLADESH</p>
        </div>
      </section>

      {imageZoomOpen && (
        <div role="dialog" aria-modal="true" aria-label="Product image preview" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button type="button" onClick={() => setImageZoomOpen(false)} className="absolute right-5 top-5 z-10 border border-white/50 bg-black/40 px-4 py-3 text-xs tracking-widest text-white">CLOSE ✕</button>
          <div className="relative h-[85vh] w-full max-w-3xl">
            <Image src={product.image} alt={product.name} fill sizes="90vw" className="object-contain" />
          </div>
        </div>
      )}

      {relatedProducts.length > 0 && <section className="bg-[#faf6f1] px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] tracking-[3px] text-[#a17b72]">YOU MAY ALSO LIKE</p>
          <h2 className="mt-3 font-serif text-3xl text-[#403331] sm:text-4xl">More from {brandNames[product.brand]}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {relatedProducts.map((item) => <Link key={item.id} href={`/product/${item.id}`} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eee7e2]"><Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" /></div>
              <p className="mt-3 font-serif text-base text-[#403331]">{item.name}</p>
              <p className="mt-1 text-sm font-semibold text-[#493638]">৳{item.price.toLocaleString("en-BD")}</p>
            </Link>)}
          </div>
        </div>
      </section>}
    </main>
  );
}
