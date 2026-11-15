import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

const allowedStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Verify the signed-in user.
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const status = body.status;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as (typeof allowedStatuses)[number])
    ) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id, status")
      .single();

    if (error || !data) {
      console.error("Order status update failed:", error?.message);

      return NextResponse.json(
        { error: "Could not update order status" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Admin order API error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
