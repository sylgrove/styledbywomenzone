import BrandStorefront, { type BrandConfig } from "@/components/brand-storefront";

const config: BrandConfig = {
  brand: "pretty-finds",
  name: "Pretty Finds",
  categoryLabel: "Accessories and beauty",
  logo: "/logos/pretty-finds.png",
  announcement: "PRETTY FINDS · YOUR EVERYDAY DOSE OF PRETTY",
  eyebrow: "BEAUTY · CARE · LITTLE FINDS",
  headline: "Find your pretty little things.",
  intro: "Discover beauty favourites, playful accessories and everyday essentials that bring a little joy to your routine. Browse the collection and explore each item's details before adding it to your bag.",
  storyHeading: "Little things, big smiles.",
  story: "Pretty Finds is a home for beauty favourites and playful everyday accessories. Explore our growing collection of little essentials chosen to make your routine feel a little more special.",
  pageBackground: "bg-[#fffdfc]",
  heroBackground: "bg-[#f8e9ed]",
  accent: "bg-[#ad7185]",
  button: "bg-[#a96980]",
  cardBackground: "bg-[#fbf3f4]",
};

export default function PrettyFindsPage() {
  return <BrandStorefront config={config} />;
}
