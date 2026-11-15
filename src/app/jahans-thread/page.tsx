import BrandStorefront, { type BrandConfig } from "@/components/brand-storefront";

const config: BrandConfig = {
  brand: "jahans-thread",
  name: "Jahan's Thread",
  categoryLabel: "Women's clothing and fashion",
  logo: "/logos/jahans-thread.png",
  announcement: "JAHAN'S THREAD · EVERYDAY ELEGANCE, THOUGHTFULLY CURATED",
  eyebrow: "WOMEN'S FASHION · EVERYDAY TO OCCASION",
  headline: "Style that feels like your own.",
  intro: "Discover thoughtfully selected clothing, from elegant three-piece sets to expressive everyday styles. Explore the collection and find a piece that feels right for you.",
  storyHeading: "A little elegance in every detail.",
  story: "Jahan's Thread is the fashion destination within Styled By Womenzone. Our collection brings together feminine silhouettes, considered details and versatile styles for different moments and moods.",
  pageBackground: "bg-[#fffdfa]",
  heroBackground: "bg-[#f6e9e8]",
  accent: "bg-[#895d60]",
  button: "bg-[#493638]",
  cardBackground: "bg-[#fbf5f2]",
};

export default function JahansThreadPage() {
  return <BrandStorefront config={config} />;
}
