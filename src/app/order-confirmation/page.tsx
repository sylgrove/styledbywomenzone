"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import { writeCart } from "@/lib/cart";

type Order = {
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  delivery: {
    division: string;
    district: string;
    address: string;
    deliveryArea: string;
  };
  payment: string;
  notes: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    selectedOption: string;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  createdAt: string;
};

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedOrder = sessionStorage.getItem(
        "styledbywomenzone-pending-order",
      );

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        if (parsedOrder?.customer && Array.isArray(parsedOrder.items)) {
          setOrder(parsedOrder);
          writeCart([]);
        }
      }
    } catch {
      setOrder(null);
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <p className="text-sm tracking-widest text-gray-500">
          LOADING ORDER DETAILS...
        </p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#faf8f6] px-5 py-24 text-center">
        <SiteHeader />
        <h1 className="text-2xl font-light">No order found</h1>
        <p className="mt-3 text-sm text-gray-500">
          Please complete checkout before viewing your confirmation.
        </p>
        <Link
          href="/cart"
          className="mt-8 inline-block bg-[#302622] px-8 py-4 text-xs tracking-widest text-white"
        >
          RETURN TO CART
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] text-[#292421]">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="border border-[#e9e2dc] bg-white p-6 text-center md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c8b4a7] text-3xl text-[#806052]">
            ✓
          </div>

          <p className="mt-7 text-xs tracking-[0.3em] text-[#9a786b]">
            THANK YOU FOR SHOPPING WITH US
          </p>

          <h1 className="mt-3 text-3xl font-light md:text-4xl">
            Your order is confirmed!
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500">
            Thank you, {order.customer.name}. Your order details have been
            received in this browser. We appreciate your trust in Styled By
            Womenzone.
          </p>

          <div className="mt-9 border-y border-[#e9e2dc] py-6 text-left">
            <h2 className="text-lg font-medium">Order Details</h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.selectedOption}-${index}`}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>

                    {item.selectedOption && (
                      <p className="mt-1 text-xs text-gray-500">
                        Option: {item.selectedOption}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {item.quantity} × ৳
                      {item.unitPrice.toLocaleString("en-BD")}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold">
                    ৳{item.lineTotal.toLocaleString("en-BD")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-b border-[#e9e2dc] py-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>৳{order.subtotal.toLocaleString("en-BD")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Delivery charge</span>
              <span>৳{order.deliveryCharge.toLocaleString("en-BD")}</span>
            </div>

            <div className="flex justify-between border-t border-[#e9e2dc] pt-4 text-base font-semibold">
              <span>Total payable</span>
              <span>৳{order.total.toLocaleString("en-BD")}</span>
            </div>
          </div>

          <div className="py-6 text-left">
            <h2 className="text-lg font-medium">Delivery Information</h2>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                {order.customer.name}
              </p>

              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {order.customer.phone}
              </p>

              {order.customer.email && (
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {order.customer.email}
                </p>
              )}

              <p>
                <span className="text-gray-500">Address:</span>{" "}
                {order.delivery.address}, {order.delivery.district},{" "}
                {order.delivery.division}
              </p>

              <p>
                <span className="text-gray-500">Payment:</span> Cash on Delivery
              </p>

              <p>
                <span className="text-gray-500">Delivery area:</span>{" "}
                {order.delivery.deliveryArea === "inside"
                  ? "Inside Dhaka"
                  : "Outside Dhaka"}
              </p>

              {order.notes && (
                <p>
                  <span className="text-gray-500">Notes:</span> {order.notes}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 bg-[#faf6f3] p-5 text-center">
            <p className="text-sm font-medium">Payment: Cash on Delivery</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Please pay ৳{order.total.toLocaleString("en-BD")} when your order
              is delivered.
            </p>
          </div>

          <Link
            href="/"
            className="mt-9 inline-block bg-[#302622] px-10 py-4 text-xs tracking-[0.2em] text-white transition hover:bg-[#59463d]"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
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
