import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import AdminOrders from "./AdminOrders";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL;

  if (
    !user ||
    !adminEmail ||
    user.email?.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    redirect("/admin/login");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (full_name, phone, email),
      order_items (
        product_name,
        brand,
        selected_option,
        quantity,
        unit_price,
        line_total
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Admin orders error:", ordersError.message);
    throw new Error("Unable to load orders.");
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Admin products error:", productsError.message);
    throw new Error("Unable to load products.");
  }

  return <AdminOrders orders={orders ?? []} products={products ?? []} />;
}
