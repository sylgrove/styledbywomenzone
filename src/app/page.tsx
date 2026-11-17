import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { mapProductRow, type ProductRow } from "@/data/products";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const brands = [
  {
    name: "Jahan's Thread",
    category: "WOMEN'S FASHION",
    description: "Everyday elegance and thoughtfully selected clothing.",
    logo: "/logos/jahans-thread.png",
    href: "/jahans-thread",
    background: "bg-[#f6e9e8]",
    button: "text-[#895d60]",
  },
  {
    name: "WomenZone",
    category: "JEWELLERY",
    description: "The little details that make you shine.",
    logo: "/logos/womenzone.png",
    href: "/womenzone",
    background: "bg-[#eee8e8]",
    button: "text-[#794b56]",
  },
  {
    name: "Pretty Finds",
    category: "ACCESSORIES & BEAUTY",
    description: "Beauty favourites and everyday little finds.",
    logo: "/logos/pretty-finds.png",
    href: "/pretty-finds",
    background: "bg-[#f8e9ed]",
    button: "text-[#a45d78]",
  },
  {
    name: "Shyamol",
    category: "HANDCRAFTED & DESIGNER",
    description: "Artistry, tradition and timeless charm.",
    logo: "/logos/shyamol.png",
    href: "/shyamol",
    background: "bg-[#eee9df]",
    button: "text-[#786747]",
  },
];

const featuredProductIds = [
  "jahans-black-three-piece",
  "womenzone-cuff-bracelets",
  "pretty-finds-waterproof-kajal",
  "pretty-finds-beauty-blender",
];

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Homepage products could not be loaded:", error.message);
  }

  const liveProducts = (data ?? []).map((row) => mapProductRow(row as ProductRow));
  const featuredProducts = featuredProductIds
    .map((id) => liveProducts.find((product) => product.id === id))
    .filter((product): product is (typeof liveProducts)[number] => Boolean(product));

  return (
    <main className="min-h-screen bg-[#fffdfa] text-[#292321]">
      <div className="bg-[#392b2c] px-4 py-2 text-center text-[10px] tracking-[2px] text-white sm:text-xs">
        A LITTLE SOMETHING BEAUTIFUL, JUST FOR YOU
      </div>
      <SiteHeader />

      <section id="home" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24 lg:px-12 lg:py-28">
          <div className="relative z-10">
            <p className="mb-6 text-[10px] tracking-[4px] text-[#a17b72] sm:text-xs">
              STYLE · BEAUTY · EXPRESSION
            </p>
            <h1 className="max-w-xl font-serif text-5xl leading-[1.12] text-[#392d2b] sm:text-6xl lg:text-7xl">
              A world of <span className="block italic text-[#a47777]">beautiful</span> possibilities.
            </h1>
            <p className="mt-7 max-w-md text-sm leading-8 text-[#786e68]">
              Discover a thoughtfully curated world of fashion, jewellery, beauty and handcrafted treasures. Find something that feels wonderfully you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="#brands" className="bg-[#493638] px-7 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-[#76575a]">
                DISCOVER OUR BRANDS
              </Link>
              <Link href="#about" className="border-b border-[#a98a80] pb-2 text-xs text-[#6d5a54] hover:text-[#a47777]">Get to know us</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-[#f0e2df] blur-2xl" />
            <div className="absolute -bottom-5 -left-5 h-36 w-36 rounded-full bg-[#e8e0d4] blur-2xl" />
            <div className="relative flex min-h-[360px] flex-col items-center justify-center border border-[#e9ded7] bg-[#f7f0eb] px-8 py-12 text-center sm:min-h-[440px]">
              <span className="text-[10px] tracking-[5px] text-[#9a7770]">WELCOME TO</span>
              <Image src="/logos/styledbywomenzone.png" alt="Styled By Womenzone" width={330} height={150} priority className="mt-7 h-auto w-4/5 max-w-[300px] object-contain" />
              <div className="my-7 h-px w-16 bg-[#b99b8c]" />
              <p className="font-serif text-2xl italic text-[#765d55]">Curated with love.</p>
              <p className="mt-3 text-[9px] tracking-[3px] text-[#99847a]">STYLE THAT SPEAKS TO YOU</p>
            </div>
          </div>
        </div>
      </section>

      <section id="brands" className="border-y border-[#eee7e0] bg-[#faf6f1] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[10px] tracking-[4px] text-[#a17b72]">THE WORLD OF WOMENZONE</p>
            <h2 className="font-serif text-4xl text-[#3f302e] sm:text-5xl">Four brands. One beautiful world.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#82766e]">Each brand has its own personality, brought together by one shared love for thoughtful style and beautiful details.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link href={brand.href} key={brand.name} className="group overflow-hidden border border-[#e9dfd8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className={`${brand.background} flex h-64 items-center justify-center p-8`}>
                  <Image src={brand.logo} alt={brand.name} width={240} height={150} className="h-auto max-h-36 w-full object-contain transition duration-500 group-hover:scale-105" />
                </div>
                <div className="px-6 py-7 text-center">
                  <p className={`text-[9px] tracking-[2px] ${brand.button}`}>{brand.category}</p>
                  <h3 className="mt-3 font-serif text-2xl text-[#403331]">{brand.name}</h3>
                  <p className="mt-3 text-xs leading-6 text-[#877b74]">{brand.description}</p>
                  <span className="mt-5 inline-block border-b border-[#b69b8f] pb-1 text-[9px] tracking-[2px] text-[#765d55] transition group-hover:text-[#b07879]">EXPLORE BRAND →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] tracking-[4px] text-[#a17b72]">THE EDIT</p>
              <h2 className="mt-4 font-serif text-4xl text-[#3f302e] sm:text-5xl">A few lovely finds.</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#82766e]">Explore selected pieces from across our collections. Each product has its own detailed page.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f3eeea]">
                  <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-4 text-[8px] tracking-[1.5px] text-[#9b7770]">{product.brand.replaceAll("-", " ").toUpperCase()}</p>
                <h3 className="mt-2 font-serif text-base leading-snug text-[#403331] sm:text-lg">{product.name}</h3>
                <p className="mt-2 text-sm font-semibold text-[#493638]">৳{product.price.toLocaleString("en-BD")}</p>
                <span className="mt-3 inline-block text-[9px] tracking-[1.5px] text-[#866c63] underline underline-offset-4">VIEW DETAILS</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <div className="relative flex min-h-[300px] items-center justify-center bg-[#eee5dc] p-10">
            <div className="absolute inset-5 border border-[#c7b5a7]" />
            <div className="relative text-center">
              <p className="text-[10px] tracking-[4px] text-[#94776a]">MORE THAN A STORE</p>
              <h2 className="mt-6 font-serif text-5xl leading-tight text-[#493733]">A style of<br />your own.</h2>
              <p className="mt-5 font-serif text-lg italic text-[#94776a]">Be beautifully you.</p>
            </div>
          </div>
          <div>
            <p className="mb-5 text-[10px] tracking-[4px] text-[#a17b72]">OUR STORY</p>
            <h2 className="font-serif text-4xl leading-tight text-[#3f302e] sm:text-5xl">Thoughtfully chosen.<span className="block italic text-[#a47777]">Beautifully yours.</span></h2>
            <p className="mt-7 text-sm leading-8 text-[#786e68]">Styled By Womenzone brings together four distinctive brands under one roof. From everyday fashion and elegant jewellery to beauty finds and handcrafted creations, we celebrate individual expression through carefully selected collections.</p>
            <p className="mt-4 text-sm leading-8 text-[#786e68]">Our idea is simple: make discovering something beautiful feel effortless, personal and enjoyable.</p>
            <Link href="#brands" className="mt-8 inline-block border-b border-[#9c7971] pb-2 text-[10px] tracking-[2px] text-[#76534f] hover:text-[#b07879]">EXPLORE THE COLLECTIONS</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#493638] px-6 py-16 text-center sm:py-20">
        <p className="text-[10px] tracking-[4px] text-[#d8bdb2]">YOUR STYLE, YOUR STORY</p>
        <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">Find something lovely.</h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#e1d2cb]">Your next favourite find might be just around the corner.</p>
        <Link href="#brands" className="mt-8 inline-block border border-[#d9c0b6] px-8 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-white hover:text-[#493638]">START EXPLORING</Link>
      </section>

      <footer id="contact" className="bg-[#f8f4ef] px-6 pb-8 pt-14">
        <div className="mx-auto grid max-w-7xl gap-10 border-b border-[#e6ddd5] pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/logos/styledbywomenzone.png" alt="Styled By Womenzone" width={200} height={90} className="h-16 w-auto object-contain" />
            <p className="mt-4 max-w-xs text-xs leading-7 text-[#81746d]">A destination for fashion, jewellery, beauty and handcrafted treasures.</p>
          </div>
          <div>
            <h3 className="mb-5 text-[10px] tracking-[2px] text-[#493638]">EXPLORE</h3>
            <div className="space-y-3 text-xs text-[#81746d]"><Link href="#brands" className="block hover:text-[#a47777]">Our Brands</Link><Link href="#about" className="block hover:text-[#a47777]">Our Story</Link><Link href="/cart" className="block hover:text-[#a47777]">Shopping Bag</Link></div>
          </div>
          <div>
            <h3 className="mb-5 text-[10px] tracking-[2px] text-[#493638]">OUR BRANDS</h3>
            <div className="space-y-3 text-xs text-[#81746d]">{brands.map((brand) => <Link key={brand.name} href={brand.href} className="block hover:text-[#a47777]">{brand.name}</Link>)}</div>
          </div>
          <div>
            <h3 className="mb-5 text-[10px] tracking-[2px] text-[#493638]">CONNECT WITH US</h3>
            <p className="text-xs leading-7 text-[#81746d]">Follow our journey and stay connected for new collections, updates and special announcements.</p>
            <p className="mt-4 text-xs text-[#a47777]">Social media links coming soon.</p>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 pt-7 text-center text-[10px] tracking-wide text-[#95877f] sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Styled By Womenzone. All rights reserved.</p>
          <p>Made with care in Bangladesh.</p>
        </div>
      </footer>
    </main>
  );
}
