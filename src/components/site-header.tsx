"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, getCartCount, readCart } from "@/lib/cart";

const links = [
  { href: "/jahans-thread", label: "Jahan's Thread" },
  { href: "/womenzone", label: "WomenZone" },
  { href: "/pretty-finds", label: "Pretty Finds" },
  { href: "/shyamol", label: "Shyamol" },
];

export default function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount(readCart()));
    updateCount();
    window.addEventListener(CART_UPDATED_EVENT, updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee5df] bg-[#fffdfa]/95 shadow-[0_2px_12px_rgba(55,38,32,0.04)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Styled By Womenzone homepage" className="shrink-0">
          <Image
            src="/logos/styledbywomenzone.png"
            alt="Styled By Womenzone"
            width={190}
            height={72}
            priority
            className="h-11 w-auto object-contain sm:h-14"
          />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[11px] font-medium tracking-wide text-[#5e504b] transition hover:text-[#a16f72]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            aria-label={`Shopping bag, ${cartCount} items`}
            className="relative inline-flex h-10 min-w-10 items-center justify-center border border-[#d8c8bd] px-2 text-[#493638] transition hover:bg-[#f7f0eb]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M5.5 8h13l1 12h-15l1-12Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <span className="ml-1 text-[10px] font-semibold">Bag</span>
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9b626e] px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-10 w-10 items-center justify-center border border-[#e2d6ce] text-[#493638] xl:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-[#eee5df] bg-[#fffdfa] px-5 py-3 xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col">
            <Link href="/" onClick={() => setMenuOpen(false)} className="py-3 text-sm text-[#5e504b]">Home</Link>
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="border-t border-[#f0e9e4] py-3 text-sm text-[#5e504b]">
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setMenuOpen(false)} className="border-t border-[#f0e9e4] py-3 text-sm font-medium text-[#9b626e]">Shopping bag ({cartCount})</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
