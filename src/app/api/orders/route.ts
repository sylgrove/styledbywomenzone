import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProductById } from "@/data/products";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export async function POST(request: Request) {
  let customerId: string | null = null;
  let orderId: string | null = null;

  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server configuration is missing." },
        { status: 500 },
      );
    }

    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid order information." },
        { status: 400 },
      );
    }

    const { customer, delivery, payment, notes, items } = body;

    // Validate customer information
    if (
      !customer ||
      typeof customer.name !== "string" ||
      !customer.name.trim() ||
      typeof customer.phone !== "string" ||
      !/^(?:\+?88)?01[3-9][0-9]{8}$/.test(customer.phone.trim())
    ) {
      return NextResponse.json(
        {
          error: "Please provide a valid name and Bangladeshi phone number.",
        },
        { status: 400 },
      );
    }

    // Validate delivery information
    if (
      !delivery ||
      typeof delivery.division !== "string" ||
      !delivery.division.trim() ||
      typeof delivery.district !== "string" ||
      !delivery.district.trim() ||
      typeof delivery.address !== "string" ||
      !delivery.address.trim() ||
      !["inside", "outside"].includes(delivery.deliveryArea)
    ) {
      return NextResponse.json(
        { error: "Please provide complete delivery information." },
        { status: 400 },
      );
    }

    // Cash on Delivery is currently the only supported payment method
    if (payment !== "cod") {
      return NextResponse.json(
        { error: "Currently, only Cash on Delivery is available." },
        { status: 400 },
      );
    }

    // Validate cart
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { error: "Your cart is empty or contains too many items." },
        { status: 400 },
      );
    }

    // Validate each product and calculate prices from our catalogue
    const orderItems: {
      product_id: string;
      product_name: string;
      brand: string;
      selected_option: string | null;
      quantity: number;
      unit_price: number;
      line_total: number;
    }[] = [];

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20 ||
        typeof item.selectedOption !== "string"
      ) {
        return NextResponse.json(
          { error: "One or more cart items are invalid." },
          { status: 400 },
        );
      }

      const product = getProductById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart could not be found." },
          { status: 400 },
        );
      }

      const availableOptions = [
        ...(product.options ?? []),
        ...(product.sizeOptions ?? []),
      ];

      if (
        (availableOptions.length > 0 &&
          !availableOptions.includes(item.selectedOption)) ||
        (availableOptions.length === 0 && item.selectedOption !== "")
      ) {
        return NextResponse.json(
          { error: `Please select a valid option for ${product.name}.` },
          { status: 400 },
        );
      }

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        selected_option: item.selectedOption || null,
        quantity: item.quantity,
        unit_price: product.price,
        line_total: product.price * item.quantity,
      });
    }

    // Calculate totals on the server, not from browser-submitted prices
    const subtotal = orderItems.reduce((sum, item) => sum + item.line_total, 0);

    const deliveryCharge = delivery.deliveryArea === "inside" ? 80 : 130;

    const total = subtotal + deliveryCharge;

    // 1. Save customer
    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .insert({
        full_name: customer.name.trim(),
        phone: customer.phone.trim(),
        email:
          typeof customer.email === "string" && customer.email.trim()
            ? customer.email.trim()
            : null,
      })
      .select("id")
      .single();

    if (customerError || !customerData) {
      throw customerError || new Error("Could not create customer.");
    }

    customerId = customerData.id;

    // 2. Save order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        division: delivery.division.trim(),
        district: delivery.district.trim(),
        full_address: delivery.address.trim(),
        delivery_area: delivery.deliveryArea,
        payment_method: "Cash on Delivery",
        subtotal,
        delivery_charge: deliveryCharge,
        total,
        notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderData) {
      throw orderError || new Error("Could not create order.");
    }

    orderId = orderData.id;

    // 3. Save order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({
        ...item,
        order_id: orderId,
      })),
    );

    if (itemsError) {
      throw itemsError;
    }

    // Return successful order details
    return NextResponse.json(
      {
        success: true,
        order: {
          id: orderData.id,
          order_number: orderData.order_number,
          subtotal,
          deliveryCharge,
          total,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation failed:", error);

    // Remove incomplete order if saving failed
    if (supabase && orderId) {
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (cleanupError) {
        console.error("Order cleanup failed:", cleanupError);
      }
    }

    // Remove customer if order creation failed
    if (supabase && customerId) {
      const { error: cleanupError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (cleanupError) {
        console.error("Customer cleanup failed:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: "We couldn't place your order. Please try again." },
      { status: 500 },
    );
  }
}
