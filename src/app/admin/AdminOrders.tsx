"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Order = {
  id: string;
  order_number: number;
  full_address: string;
  division: string;
  district: string;
  delivery_area: string;
  payment_method: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  notes: string | null;
  status: string;
  created_at: string;
  customers: {
    full_name: string;
    phone: string;
    email: string | null;
  } | null;
  order_items: {
    product_name: string;
    brand: string;
    selected_option: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
};

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrders({
  orders: initialOrders,
}: {
  orders: Order[];
}) {
  const router = useRouter();

  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(orderId: string, status: string) {
    setSavingId(orderId);
    setError("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );

      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status } : current,
      );

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingId(null);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f8f6f2] p-5 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Styled By Womenzone
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Store Administration Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            Sign out
          </button>
        </header>

        {/* Overview */}
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {totalOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              {pendingOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Total Order Value</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">
              ৳{totalSales.toLocaleString("en-BD")}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <section className="bg-white rounded-xl border overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Manage Orders
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select an order to view its full details.
            </p>
          </div>

          {error && (
            <p className="p-4 text-sm text-red-700 bg-red-50" role="alert">
              {error}
            </p>
          )}

          {!orders.length ? (
            <p className="p-8 text-center text-gray-600">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-200">
                      <td className="p-4 font-medium text-gray-900">
                        #{order.order_number}
                      </td>

                      <td className="p-4 text-gray-800">
                        {order.customers?.full_name ?? "Unknown"}
                      </td>

                      <td className="p-4 text-gray-700">
                        {order.customers?.phone ?? "—"}
                      </td>

                      <td className="p-4 whitespace-nowrap text-gray-900 font-medium">
                        ৳{Number(order.total).toLocaleString("en-BD")}
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          disabled={savingId === order.id}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                          className="rounded-lg border border-gray-300 bg-white p-2 capitalize text-gray-800 disabled:opacity-50"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <section
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{selectedOrder.order_number}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString("en-GB")}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-2xl text-gray-600 hover:text-gray-900"
                  aria-label="Close order details"
                >
                  ×
                </button>
              </div>

              {/* Customer Information */}
              <div className="border-b border-gray-200 pb-5 mb-5">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Customer information
                </h3>

                <p className="text-gray-900">
                  {selectedOrder.customers?.full_name ?? "Unknown"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Phone: {selectedOrder.customers?.phone ?? "—"}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Email: {selectedOrder.customers?.email || "Not provided"}
                </p>
              </div>

              {/* Delivery Information */}
              <div className="border-b border-gray-200 pb-5 mb-5">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Delivery information
                </h3>

                <p className="text-sm text-gray-800">
                  {selectedOrder.full_address}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  {selectedOrder.district}, {selectedOrder.division}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Delivery area: {selectedOrder.delivery_area}
                </p>

                <p className="text-sm text-gray-700 mt-1">
                  Payment: {selectedOrder.payment_method}
                </p>
              </div>

              {/* Products Ordered */}
              <div className="border-b border-gray-200 pb-5 mb-5">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Products ordered
                </h3>

                {selectedOrder.order_items.map((item, index) => (
                  <div
                    key={`${selectedOrder.id}-${index}`}
                    className="flex justify-between gap-4 py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        {item.brand}
                        {item.selected_option
                          ? ` · ${item.selected_option}`
                          : ""}
                      </p>

                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium whitespace-nowrap text-gray-900">
                      ৳{Number(item.line_total).toLocaleString("en-BD")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ৳{Number(selectedOrder.subtotal).toLocaleString("en-BD")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery charge</span>
                  <span>
                    ৳
                    {Number(selectedOrder.delivery_charge).toLocaleString(
                      "en-BD",
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>
                    ৳{Number(selectedOrder.total).toLocaleString("en-BD")}
                  </span>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div className="mt-5 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-900">
                    Customer notes
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Update Order Status */}
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Update order status
                </label>

                <select
                  value={selectedOrder.status}
                  disabled={savingId === selectedOrder.id}
                  onChange={(e) =>
                    updateStatus(selectedOrder.id, e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 bg-white text-gray-800 capitalize disabled:opacity-50"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {savingId === selectedOrder.id && (
                  <p className="text-xs text-gray-600 mt-2">Saving status...</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
