"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { mapProductRow, type Product, type ProductRow } from "@/data/products";
import SiteHeader from "@/components/site-header";
import { readCart, writeCart, type CartItem } from "@/lib/cart";
import { createClient } from "@/utils/supabase/client";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCartAndProducts() {
      const savedCart = readCart();
      const productIds = [...new Set(savedCart.map((item) => item.productId))];
      let liveProducts: Product[] = [];

      if (productIds.length > 0) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds)
          .eq("is_published", true);

        if (error) {
          console.error("Cart products could not be loaded:", error.message);
          if (active) setLoadError("We couldn't load your product details. Please refresh the page.");
        } else {
          liveProducts = (data ?? []).map((row) => mapProductRow(row as ProductRow));
        }
      }

      if (active) {
        setCart(savedCart);
        setProducts(liveProducts);
        setLoaded(true);
      }
    }

    loadCartAndProducts();
    return () => { active = false; };
  }, []);

  const items = useMemo(() => {
    const productsById = new Map(products.map((product) => [product.id, product] as const));
    return cart
      .map((item) => ({ ...item, product: productsById.get(item.productId) }))
      .filter((item): item is CartItem & { product: Product } => Boolean(item.product));
  }, [cart, products]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasUnavailableItems = items.some((item) => !item.product.available);

  function updateQuantity(productId: string, selectedOption: string, change: number) {
    const updated = cart
      .map((item) => item.productId === productId && item.selectedOption === selectedOption
        ? { ...item, quantity: item.quantity + change }
        : item)
      .filter((item) => item.quantity > 0);
    setCart(updated);
    writeCart(updated);
  }

  function removeItem(productId: string, selectedOption: string) {
    const updated = cart.filter((item) => !(item.productId === productId && item.selectedOption === selectedOption));
    setCart(updated);
    writeCart(updated);
  }

  if (!loaded) return <main className="flex min-h-screen items-center justify-center bg-[#faf8f6]"><p className="text-xs tracking-widest text-gray-500">LOADING YOUR BAG...</p></main>;

  return (
    <main className="min-h-screen bg-[#faf8f6] text-[#292421]">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-[#9a786b]">YOUR SELECTION</p>
          <h1 className="font-serif text-4xl font-light tracking-wide">Shopping Bag</h1>
          <p className="mt-3 text-sm text-gray-500">Your favourite finds, all in one place.</p>
        </div>

        {loadError && <p role="alert" className="mb-6 border border-red-200 bg-white p-4 text-sm text-red-700">{loadError}</p>}

        {items.length === 0 ? (
          <div className="mx-auto max-w-xl border border-[#e9e2dc] bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f7f0eb] text-2xl text-[#806052]">♡</div>
            <h2 className="mt-5 text-xl font-medium">Your bag is empty</h2>
            <p className="mt-3 text-sm text-gray-500">Looks like you haven't added anything to your bag yet.</p>
            <Link href="/" className="mt-8 inline-block bg-[#302622] px-8 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#59463d]">EXPLORE OUR COLLECTIONS</Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              {items.map(({ product, quantity, selectedOption }) => (
                <article key={`${product.id}-${selectedOption}`} className="flex gap-4 border border-[#e9e2dc] bg-white p-4 sm:gap-6 sm:p-6">
                  <Link href={`/product/${product.id}`} className="relative h-32 w-28 shrink-0 overflow-hidden bg-[#f5f1ed] sm:h-40 sm:w-36">
                    <Image src={product.image} alt={product.name} fill sizes="144px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a786b]">{product.brand.replaceAll("-", " ")}</p>
                      <Link href={`/product/${product.id}`} className="mt-2 block text-sm font-medium hover:underline sm:text-base">{product.name}</Link>
                      {selectedOption && <p className="mt-2 text-xs text-gray-500">Selected: {selectedOption}</p>}
                      <p className="mt-2 text-xs text-gray-500">Unit price: ৳{product.price.toLocaleString("en-BD")} × {quantity}</p>
                      <p className="mt-1 text-base font-semibold">৳{(product.price * quantity).toLocaleString("en-BD")}</p>
                      {!product.available && <p className="mt-2 text-xs font-medium text-red-700">Currently unavailable. Remove this item to continue.</p>}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center border border-[#e9e2dc]">
                        <button type="button" onClick={() => updateQuantity(product.id, selectedOption, -1)} className="px-3 py-2 text-sm hover:bg-[#faf8f6]" aria-label={`Decrease ${product.name} quantity`}>−</button>
                        <span className="min-w-8 text-center text-sm" aria-live="polite">{quantity}</span>
                        <button type="button" onClick={() => updateQuantity(product.id, selectedOption, 1)} className="px-3 py-2 text-sm hover:bg-[#faf8f6]" aria-label={`Increase ${product.name} quantity`}>+</button>
                      </div>
                      <button type="button" onClick={() => removeItem(product.id, selectedOption)} className="text-xs text-[#9a6258] underline underline-offset-4 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit border border-[#e9e2dc] bg-white p-6">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <div className="mt-6 flex justify-between text-sm"><span className="text-gray-500">Items ({itemCount})</span><span>{itemCount}</span></div>
              <div className="mt-4 flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>৳{subtotal.toLocaleString("en-BD")}</span></div>
              <div className="mt-4 flex justify-between border-t border-[#e9e2dc] pt-4 text-sm"><span className="text-gray-500">Delivery</span><span className="text-gray-500">Calculated at checkout</span></div>
              <div className="mt-5 border-t border-[#e9e2dc] pt-5 text-xs leading-5 text-gray-500">Your final payable amount, including delivery, will be shown before you place your order.</div>
              {hasUnavailableItems ? (
                <p className="mt-7 border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">Remove unavailable products before proceeding to checkout.</p>
              ) : (
                <Link href="/checkout" className="mt-7 block bg-[#302622] px-5 py-4 text-center text-xs tracking-[0.2em] text-white transition hover:bg-[#59463d]">PROCEED TO CHECKOUT</Link>
              )}
              <p className="mt-4 text-center text-xs leading-5 text-gray-500">Delivery charges will be added during checkout.</p>
              <Link href="/" className="mt-6 block text-center text-xs text-gray-600 underline underline-offset-4">Continue shopping</Link>
            </aside>
          </div>
        )}
      </section>
      <footer className="border-t border-[#e9e2dc] bg-white py-7 text-center">
        <p className="text-[10px] tracking-[0.25em] text-gray-500">STYLED BY WOMENZONE</p>
        <p className="mt-2 text-xs text-gray-400">A little something beautiful for everyone.</p>
      </footer>
    </main>
  );
}
