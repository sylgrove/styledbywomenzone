import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site-header";

export default function ShyamolPage() {
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
          <p className="mt-5 border-l-2 border-[#b7a17b] pl-4 text-sm leading-7 text-[#766b5d]">We're preparing this collection. Products will appear here as soon as they are ready.</p>
          <Link href="/" className="mt-8 inline-block bg-[#6f5a3f] px-7 py-4 text-[10px] tracking-[2px] text-white transition hover:bg-[#8b7353]">EXPLORE ALL BRANDS</Link>
        </div>
        <div className="relative flex min-h-[360px] items-center justify-center border border-[#e4d9c7] bg-[#f0e9dc] p-10 md:min-h-[520px]">
          <div className="absolute inset-5 border border-[#c9b99e]" />
          <div className="relative text-center">
            <p className="text-[10px] tracking-[4px] text-[#917b58]">শ্যামল</p>
            <h2 className="mt-5 font-serif text-4xl text-[#554631]">The art of thoughtful living.</h2>
            <p className="mt-5 font-serif text-lg italic text-[#917b58]">Coming soon</p>
          </div>
        </div>
      </section>
      <footer className="border-t border-[#e4d9c7] bg-white px-5 py-8 text-center">
        <p className="text-[10px] tracking-[2px] text-[#766b5d]">SHYAMOL · A BRAND BY STYLED BY WOMENZONE</p>
        <p className="mt-2 text-xs text-[#9a8d7d]">Made with care in Bangladesh.</p>
      </footer>
    </main>
  );
}
