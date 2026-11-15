import BrandStorefront, { type BrandConfig } from "@/components/brand-storefront";

const config: BrandConfig = {
  brand: "womenzone",
  name: "WomenZone",
  categoryLabel: "Jewellery",
  logo: "/logos/womenzone.png",
  announcement: "WOMENZONE · THE LITTLE DETAILS THAT MAKE YOU SHINE",
  eyebrow: "JEWELLERY · DETAILS THAT SHINE",
  headline: "A little sparkle, a lot of personality.",
  intro: "Explore jewellery pieces selected to add an elegant finishing touch, from everyday rings and bracelets to statement details.",
  storyHeading: "Details that make a difference.",
  story: "WomenZone celebrates the finishing touches. Discover an edit of fashion jewellery and accessories selected to bring a little extra character to everyday dressing.",
  pageBackground: "bg-[#fffdfb]",
  heroBackground: "bg-[#eee8e8]",
  accent: "bg-[#794b56]",
  button: "bg-[#542d37]",
  cardBackground: "bg-[#faf5f3]",
};

export default function WomenZonePage() {
  return <BrandStorefront config={config} />;
}
