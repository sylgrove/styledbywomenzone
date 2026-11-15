export type ProductBrand = "jahans-thread" | "womenzone" | "pretty-finds" | "shyamol";

export type Product = {
  id: string;
  brand: ProductBrand;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  badge?: string;
  options?: string[];
  sizeOptions?: string[];
};

export const products: Product[] = [
  // JAHAN'S THREAD
  {
    id: "jahans-black-three-piece",
    brand: "jahans-thread",
    name: "Black Boutique Ready Three Piece",
    category: "Boutique Collection",
    price: 1850,
    originalPrice: 2000,
    image: "/products/jahans-thread/black-three-piece.png",
    description:
      "Elegant black boutique ready three-piece with colourful floral embroidery.",
    badge: "Special Offer",
  },
  {
    id: "jahans-maroon-three-piece",
    brand: "jahans-thread",
    name: "Maroon Boutique Ready Three Piece",
    category: "Boutique Collection",
    price: 1950,
    originalPrice: 2200,
    image: "/products/jahans-thread/maroon-three-piece.png",
    description:
      "Beautiful maroon boutique ready three-piece with detailed embroidery and a mustard dupatta.",
    badge: "Special Offer",
  },
  {
    id: "jahans-magenta-coord-set",
    brand: "jahans-thread",
    name: "Magenta Co-ord Set",
    category: "Co-ord Collection",
    price: 1400,
    image: "/products/jahans-thread/magenta-coord-set.png",
    description: "Magenta co-ord set featuring a tie-dye-inspired print.",
  },
  {
    id: "jahans-floral-silk-three-piece",
    brand: "jahans-thread",
    name: "White & Orange Floral Silk Three Piece",
    category: "Silk Collection",
    price: 1650,
    image: "/products/jahans-thread/floral-silk-three-piece.png",
    description: "White and orange floral printed silk three-piece.",
    badge: "New Arrival",
  },

  // WOMENZONE
  {
    id: "womenzone-cuff-bracelets",
    brand: "womenzone",
    name: "Cuff Bracelets",
    category: "Bracelets",
    price: 420,
    image: "/products/womenzone/cuff-bracelets.png",
    description: "Stylish cuff bracelets for an elegant everyday look.",
  },
  {
    id: "womenzone-green-stone-ring",
    brand: "womenzone",
    name: "Green Stone Adjustable Ring",
    category: "Rings",
    price: 550,
    image: "/products/womenzone/green-stone-ring.png",
    description:
      "Xuping brand adjustable ring featuring a beautiful green stone.",
    badge: "Xuping Brand",
  },
  {
    id: "womenzone-kashmiri-bangles",
    brand: "womenzone",
    name: "Kashmiri Adjustable Bangles",
    category: "Bangles",
    price: 230,
    image: "/products/womenzone/kashmiri-bangles.png",
    description: "Kashmiri adjustable bangles, sold as a pair.",
  },
  {
    id: "womenzone-oxidised-ghungroo",
    brand: "womenzone",
    name: "Oxidised Ghungroo Bangle Set",
    category: "Bangles",
    price: 450,
    image: "/products/womenzone/oxidised-ghungroo-bangles.png",
    description:
      "Oxidised ghungroo bangle set. Available in sizes 2.6 and 2.8.",
    options: ["2.6", "2.8"],
  },
  {
    id: "womenzone-pearl-ring",
    brand: "womenzone",
    name: "Xuping Adjustable Pearl Ring",
    category: "Rings",
    price: 450,
    image: "/products/womenzone/pearl-ring.png",
    description: "Elegant adjustable pearl ring from Xuping.",
    badge: "Xuping Brand",
  },
  {
    id: "womenzone-xuping-adjustable-ring",
    brand: "womenzone",
    name: "Xuping Adjustable Ring",
    category: "Rings",
    price: 450,
    image: "/products/womenzone/xuping-adjustable-ring.png",
    description: "Stylish adjustable ring from Xuping.",
    badge: "Xuping Brand",
  },

  // PRETTY FINDS
  {
    id: "pretty-finds-waterproof-kajal",
    brand: "pretty-finds",
    name: "Beauty Glazed Waterproof Kajal Liner",
    category: "Eye Makeup",
    price: 199,
    image: "/products/pretty-finds/waterproof-kajal.png",
    description: "Beauty Glazed waterproof kajal liner.",
    options: ["Nude", "Black", "White", "Blue"],
  },
  {
    id: "pretty-finds-rainbow-nails",
    brand: "pretty-finds",
    name: "Rainbow False Nails",
    category: "Nail Collection",
    price: 350,
    originalPrice: 400,
    image: "/products/pretty-finds/rainbow-false-nails.png",
    description: "Colourful rainbow-inspired false nails.",
    badge: "Special Offer",
  },
  {
    id: "pretty-finds-maroon-nails",
    brand: "pretty-finds",
    name: "Maroon False Nails",
    category: "Nail Collection",
    price: 350,
    originalPrice: 400,
    image: "/products/pretty-finds/maroon-false-nails.png",
    description: "Elegant maroon false nails.",
    badge: "Special Offer",
  },
  {
    id: "pretty-finds-floral-nails",
    brand: "pretty-finds",
    name: "Floral False Nails",
    category: "Nail Collection",
    price: 350,
    originalPrice: 400,
    image: "/products/pretty-finds/floral-false-nails.png",
    description: "Beautiful floral-inspired false nails.",
    badge: "Special Offer",
  },
  {
    id: "pretty-finds-beauty-blender",
    brand: "pretty-finds",
    name: "Soft Beauty Blender",
    category: "Beauty Essentials",
    price: 80,
    image: "/products/pretty-finds/beauty-blender.png",
    description: "Soft beauty blender for makeup application.",
  },
  {
    id: "pretty-finds-glow-lip-gloss",
    brand: "pretty-finds",
    name: "Beauty Glazed Glow Lip Gloss",
    category: "Lip Collection",
    price: 180,
    image: "/products/pretty-finds/glow-lip-gloss.png",
    description: "Beauty Glazed Glow Lip Gloss in three shades.",
    options: ["101 Rosy", "103 Cherry", "106 Chocolate"],
  },
  {
    id: "pretty-finds-waterproof-lip-liner",
    brand: "pretty-finds",
    name: "Beauty Glazed Waterproof Lip Liner",
    category: "Lip Collection",
    price: 150,
    originalPrice: 180,
    image: "/products/pretty-finds/waterproof-lip-liner.png",
    description: "Waterproof and long-lasting Beauty Glazed lip liner.",
    badge: "Special Offer",
  },
  {
    id: "pretty-finds-boots-shower-gel",
    brand: "pretty-finds",
    name: "Boots 3 in 1 Shower Gel, Bubble Bath & Shampoo",
    category: "Body Care",
    price: 1550,
    originalPrice: 1700,
    image: "/products/pretty-finds/boots-shower-gel.png",
    description: "Boots 3 in 1 Shower Gel, Bubble Bath and Shampoo, 500ml.",
    badge: "500ml",
  },
  {
    id: "pretty-finds-sun-bears-sunscreen",
    brand: "pretty-finds",
    name: "Sun Bears Active Protect Cool Sunscreen",
    category: "Sun Care",
    price: 450,
    originalPrice: 550,
    image: "/products/pretty-finds/sun-bears-sunscreen.png",
    description: "Sun Bears Active Protect Cool Sunscreen SPF 50+ PA++++, 30g.",
    badge: "SPF 50+",
  },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsByBrand(brand: Product["brand"]) {
  return products.filter((product) => product.brand === brand);
}
