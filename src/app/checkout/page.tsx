"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { mapProductRow, type Product, type ProductRow } from "@/data/products";
import { createClient } from "@/utils/supabase/client";

import SiteHeader from "@/components/site-header";

type CartItem = {
  productId: string;

  quantity: number;

  selectedOption: string;
};

const CART_KEY = "styledbywomenzone-cart";

const divisions = [
  "Dhaka",

  "Chattogram",

  "Rajshahi",

  "Khulna",

  "Barishal",

  "Sylhet",

  "Rangpur",

  "Mymensingh",
];

const districts: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",

    "Faridpur",

    "Gazipur",

    "Gopalganj",

    "Kishoreganj",

    "Madaripur",

    "Manikganj",

    "Munshiganj",

    "Narayanganj",

    "Narsingdi",

    "Rajbari",

    "Shariatpur",

    "Tangail",
  ],

  Chattogram: [
    "Chattogram",

    "Bandarban",

    "Brahmanbaria",

    "Chandpur",

    "Cumilla",

    "Cox's Bazar",

    "Feni",

    "Khagrachhari",

    "Lakshmipur",

    "Noakhali",

    "Rangamati",
  ],

  Rajshahi: [
    "Rajshahi",

    "Bogura",

    "Joypurhat",

    "Naogaon",

    "Natore",

    "Chapainawabganj",

    "Pabna",

    "Sirajganj",
  ],

  Khulna: [
    "Khulna",

    "Bagerhat",

    "Chuadanga",

    "Jashore",

    "Jhenaidah",

    "Kushtia",

    "Magura",

    "Meherpur",

    "Narail",

    "Satkhira",
  ],

  Barishal: [
    "Barishal",

    "Barguna",

    "Bhola",

    "Jhalokathi",

    "Patuakhali",

    "Pirojpur",
  ],

  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],

  Rangpur: [
    "Rangpur",

    "Dinajpur",

    "Gaibandha",

    "Kurigram",

    "Lalmonirhat",

    "Nilphamari",

    "Panchagarh",

    "Thakurgaon",
  ],

  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const [products, setProducts] = useState<Product[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");

  const [division, setDivision] = useState("");

  const [district, setDistrict] = useState("");

  const [address, setAddress] = useState("");

  const [deliveryArea, setDeliveryArea] = useState("outside");

  const [payment, setPayment] = useState("cod");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCheckoutProducts() {
      let savedCart: CartItem[] = [];

      try {
        const saved = localStorage.getItem(CART_KEY);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          savedCart = parsed.filter(
            (item): item is CartItem =>
              item !== null &&
              typeof item === "object" &&
              typeof item.productId === "string" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0 &&
              typeof item.selectedOption === "string",
          );
        }
      } catch {
        savedCart = [];
      }

      const productIds = [...new Set(savedCart.map((item) => item.productId))];
      let liveProducts: Product[] = [];

      if (productIds.length > 0) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds)
          .eq("is_published", true);

        if (error) {
          console.error("Checkout products could not be loaded:", error.message);
        } else {
          liveProducts = (data ?? []).map((row) => mapProductRow(row as ProductRow));
        }
      }

      if (active) {
        setCart(savedCart);
        setProducts(liveProducts);
        setLoaded(true);
      }
    }

    loadCheckoutProducts();
    return () => { active = false; };
  }, []);

  const items = useMemo(() => {
    const productsById = new Map(products.map((product) => [product.id, product] as const));
    return cart
      .map((item) => ({ ...item, product: productsById.get(item.productId) }))
      .filter((item): item is CartItem & { product: Product } => Boolean(item.product));
  }, [cart, products]);

  const unavailableItems = items.filter((item) => !item.product.available);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product!.price * item.quantity,

    0,
  );

  const deliveryCharge = deliveryArea === "inside" ? 80 : 130;

  const total = subtotal + deliveryCharge;

  const availableDistricts = division ? districts[division] || [] : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0 || submitting) return;

    if (unavailableItems.length > 0) {
      setSubmitError("One or more products are currently unavailable. Please remove them from your bag.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: { name, phone, email },
          delivery: { division, district, address, deliveryArea },
          payment,
          notes,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedOption: item.selectedOption ?? "",
          })),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success || !result?.order) {
        throw new Error(
          result?.error || "We couldn't place your order. Please try again.",
        );
      }

      // Preserve the confirmation page's existing data format.
      const order = {
        orderId: result.order.id,
        orderNumber: result.order.order_number,
        customer: { name, phone, email },
        delivery: { division, district, address, deliveryArea },
        payment,
        notes,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.product!.name,
          quantity: item.quantity,
          selectedOption: item.selectedOption,
          unitPrice: item.product!.price,
          lineTotal: item.product!.price * item.quantity,
        })),
        subtotal: Number(result.order.subtotal),
        deliveryCharge: Number(result.order.deliveryCharge),
        total: Number(result.order.total),
        createdAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        "styledbywomenzone-pending-order",
        JSON.stringify(order),
      );

      window.location.href = "/order-confirmation";
    } catch (error) {
      console.error("Checkout submission failed:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <p className="text-sm tracking-widest text-gray-500">
          LOADING CHECKOUT...
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f6] px-5 py-24 text-center">
        <SiteHeader />

        <h1 className="text-2xl font-light">Your shopping bag is empty</h1>

        <p className="mt-3 text-sm text-gray-500">
          Add products before proceeding to checkout.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block bg-[#302622] px-8 py-4 text-xs tracking-widest text-white"
        >
          CONTINUE SHOPPING
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] text-[#292421]">
      <SiteHeader />

      <div className="mx-auto flex max-w-6xl justify-end px-5 pt-4">
        <Link
          href="/cart"
          className="text-xs tracking-widest text-gray-600 underline underline-offset-4"
        >
          BACK TO BAG
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs tracking-[0.3em] text-[#9a786b]">
            ALMOST YOURS
          </p>

          <h1 className="text-3xl font-light tracking-wide md:text-4xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Please enter your delivery details below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-10 lg:grid-cols-[1fr_360px]"
        >
          <div className="space-y-8">
            <section className="border border-[#e9e2dc] bg-white p-6 md:p-8">
              <h2 className="text-lg font-medium">01. Contact Information</h2>

              <p className="mt-2 text-xs text-gray-500">
                Your details for order updates and delivery.
              </p>

              <div className="mt-6 grid gap-5">
                <Field label="Full Name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={inputStyle}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone Number">
                    <input
                      required
                      type="tel"
                      pattern="(?:\+?88)?01[3-9][0-9]{8}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className={inputStyle}
                    />
                  </Field>

                  <Field label="Email Address (Optional)">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputStyle}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="border border-[#e9e2dc] bg-white p-6 md:p-8">
              <h2 className="text-lg font-medium">02. Delivery Address</h2>

              <p className="mt-2 text-xs text-gray-500">
                Where should we deliver your order?
              </p>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Division">
                    <select
                      required
                      value={division}
                      onChange={(e) => {
                        setDivision(e.target.value);

                        setDistrict("");
                      }}
                      className={inputStyle}
                    >
                      <option value="">Select division</option>

                      {divisions.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="District">
                    <select
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!division}
                      className={inputStyle}
                    >
                      <option value="">Select district</option>

                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Full Address">
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, road, area, village or landmark..."
                    className={inputStyle}
                  />
                </Field>

                <Field label="Delivery Area">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer border p-4 ${deliveryArea === "inside" ? "border-[#806052] bg-[#faf6f3]" : "border-[#e9e2dc]"}`}
                    >
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="inside"
                        checked={deliveryArea === "inside"}
                        onChange={() => setDeliveryArea("inside")}
                        className="mr-2 accent-[#806052]"
                      />

                      <span className="text-sm font-medium">Inside Dhaka</span>

                      <p className="mt-2 pl-6 text-xs text-gray-500">
                        ৳80 delivery charge
                      </p>
                    </label>

                    <label
                      className={`cursor-pointer border p-4 ${deliveryArea === "outside" ? "border-[#806052] bg-[#faf6f3]" : "border-[#e9e2dc]"}`}
                    >
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="outside"
                        checked={deliveryArea === "outside"}
                        onChange={() => setDeliveryArea("outside")}
                        className="mr-2 accent-[#806052]"
                      />

                      <span className="text-sm font-medium">Outside Dhaka</span>

                      <p className="mt-2 pl-6 text-xs text-gray-500">
                        ৳130 delivery charge
                      </p>
                    </label>
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    These are temporary example rates. Confirm your courier
                    rates before launch.
                  </p>
                </Field>
              </div>
            </section>

            <section className="border border-[#e9e2dc] bg-white p-6 md:p-8">
              <h2 className="text-lg font-medium">03. Payment Method</h2>

              <label className="mt-6 flex cursor-pointer items-start gap-3 border border-[#806052] bg-[#faf6f3] p-5">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  className="mt-1 accent-[#806052]"
                />

                <span>
                  <span className="block text-sm font-medium">
                    Cash on Delivery
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Pay in cash when your order arrives.
                  </span>
                </span>
              </label>
            </section>

            <section className="border border-[#e9e2dc] bg-white p-6 md:p-8">
              <h2 className="text-lg font-medium">04. Additional Notes</h2>

              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special delivery instructions? (Optional)"
                className={`${inputStyle} mt-5`}
              />
            </section>
          </div>

          <aside className="h-fit border border-[#e9e2dc] bg-white p-6 md:p-7">
            <h2 className="text-lg font-medium">Your Order</h2>

            <p className="mt-2 text-xs text-gray-500">
              {items.reduce((sum, item) => sum + item.quantity, 0)} item(s) in
              your bag
            </p>

            <div className="mt-6 space-y-5">
              {items.map((item) => (
                <div
                  key={`${item.product!.id}-${item.selectedOption}`}
                  className="flex gap-4"
                >
                  <div className="relative h-20 w-16 shrink-0 bg-[#f5f1ed]">
                    <Image
                      src={item.product!.image}
                      alt={item.product!.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.product!.name}</p>

                    {item.selectedOption && (
                      <p className="mt-1 text-xs text-gray-500">
                        {item.selectedOption}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      ৳
                      {(item.product!.price * item.quantity).toLocaleString(
                        "en-BD",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 space-y-4 border-t border-[#e9e2dc] pt-5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>

                <span>৳{subtotal.toLocaleString("en-BD")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Delivery charge</span>

                <span>৳{deliveryCharge.toLocaleString("en-BD")}</span>
              </div>

              <div className="flex justify-between border-t border-[#e9e2dc] pt-5 text-base font-semibold">
                <span>Total payable</span>

                <span>৳{total.toLocaleString("en-BD")}</span>
              </div>
            </div>

            {unavailableItems.length > 0 && (
              <p role="alert" className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                One or more products are currently unavailable. Please remove them from your bag before placing the order.
              </p>
            )}

            {submitError && (
              <p
                role="alert"
                className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || unavailableItems.length > 0}
              className="mt-7 w-full bg-[#302622] px-5 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#59463d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "PLACING YOUR ORDER..."
                : `PLACE ORDER · ৳${total.toLocaleString("en-BD")}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              By placing your order, you confirm that your contact and delivery
              information is correct.
            </p>
          </aside>
        </form>
      </section>

      <footer className="border-t border-[#e9e2dc] bg-white py-7 text-center">
        <p className="text-[10px] tracking-[0.25em] text-gray-500">
          STYLED BY WOMENZONE
        </p>

        <p className="mt-2 text-xs text-gray-400">
          A little something beautiful for everyone.
        </p>
      </footer>
    </main>
  );
}

const inputStyle =
  "w-full border border-[#e9e2dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9a786b] disabled:bg-gray-100";

function Field({
  label,

  children,
}: {
  label: string;

  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium tracking-wide text-gray-700">
        {label}
      </span>

      {children}
    </label>
  );
}
