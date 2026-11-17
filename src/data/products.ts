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
  options: string[];
  sizeOptions: string[];
  available: boolean;
  isPublished: boolean;
};

export type ProductRow = {
  id: string;
  brand: ProductBrand;
  name: string;
  category: string;
  price: number | string;
  original_price: number | string | null;
  image: string;
  description: string | null;
  badge: string | null;
  options: unknown;
  size_options: unknown;
  available: boolean;
  is_published: boolean;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/** Converts the Supabase products row (snake_case) to the existing storefront shape. */
export function mapProductRow(row: ProductRow): Product {
  const originalPrice = row.original_price == null
    ? undefined
    : Number(row.original_price);

  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    ...(originalPrice === undefined ? {} : { originalPrice }),
    image: row.image,
    description: row.description ?? "",
    ...(row.badge ? { badge: row.badge } : {}),
    options: stringArray(row.options),
    sizeOptions: stringArray(row.size_options),
    available: row.available ?? true,
    isPublished: row.is_published ?? true,
  };
}
