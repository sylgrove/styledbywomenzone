"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Product = {
  id: string;
  brand: "jahans-thread" | "womenzone" | "pretty-finds" | "shyamol";
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  image: string;
  description: string;
  badge: string | null;
  options: string[];
  size_options: string[];
  available: boolean;
  is_published: boolean;
};

type Order = {
  id: string;
  order_number: string;
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

type Props = {
  orders: Order[];
  products: Product[];
};

const BRANDS = [
  { value: "jahans-thread", label: "Jahan's Thread" },
  { value: "womenzone", label: "WomenZone" },
  { value: "pretty-finds", label: "Pretty Finds" },
  { value: "shyamol", label: "Shyamol" },
] as const;

const emptyForm = {
  id: "",
  brand: "jahans-thread" as Product["brand"],
  name: "",
  category: "",
  price: "",
  original_price: "",
  description: "",
  badge: "",
  options: "",
  size_options: "",
  image: "",
  available: true,
  is_published: true,
};

export default function AdminOrders({
  orders: initialOrders,
  products: initialProducts,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const money = (amount: number) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // -----------------------------
  // ORDER MANAGEMENT
  // -----------------------------

  async function updateOrderStatus(orderId: string, status: string) {
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
        throw new Error(result.error || "Could not update order.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );

      setSelectedOrder((current) =>
        current?.id === orderId ? { ...current, status } : current,
      );

      setMessage("Order status updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  // -----------------------------
  // PRODUCT FORM
  // -----------------------------

  function startNewProduct() {
    setForm(emptyForm);
    setImageFile(null);
    setEditing(false);
    setShowForm(true);
    setMessage("");
  }

  function startEditProduct(product: Product) {
    setForm({
      id: product.id,
      brand: product.brand,
      name: product.name,
      category: product.category,
      price: String(product.price),
      original_price:
        product.original_price == null ? "" : String(product.original_price),
      description: product.description || "",
      badge: product.badge || "",
      options: (product.options || []).join("\n"),
      size_options: (product.size_options || []).join("\n"),
      image: product.image || "",
      available: product.available,
      is_published: product.is_published,
    });

    setImageFile(null);
    setEditing(true);
    setShowForm(true);
    setMessage("");
  }

  function splitLines(value: string) {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // -----------------------------
  // ADD / EDIT PRODUCT
  // -----------------------------

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      let imageUrl = form.image;

      // Upload a new image when selected.
      if (imageFile) {
        const extension = imageFile.name.split(".").pop() || "jpg";

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;

        const filePath = `${form.brand}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile, {
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      if (!imageUrl.trim()) {
        throw new Error("Please provide a product image.");
      }

      const productId =
        form.id ||
        `${form.brand}-${form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-${Date.now()}`;

      const productData = {
        id: productId,
        brand: form.brand,
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        original_price: form.original_price
          ? Number(form.original_price)
          : null,
        image: imageUrl,
        description: form.description.trim(),
        badge: form.badge.trim() || null,
        options: splitLines(form.options),
        size_options: splitLines(form.size_options),
        available: form.available,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };

      if (
        !productData.name ||
        !productData.category ||
        !productData.price ||
        productData.price <= 0
      ) {
        throw new Error(
          "Please enter a product name, category and valid price.",
        );
      }

      const { data, error } = await supabase
        .from("products")
        .upsert(productData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProducts((current) => {
        const exists = current.some((item) => item.id === data.id);

        return exists
          ? current.map((item) => (item.id === data.id ? data : item))
          : [data, ...current];
      });

      setShowForm(false);
      setForm(emptyForm);
      setImageFile(null);

      setMessage(
        editing
          ? "Product updated successfully."
          : "Product added successfully.",
      );

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently? This cannot be undone.`,
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));

    setMessage("Product deleted.");
    router.refresh();
  }

  // -----------------------------
  // PUBLISH / AVAILABILITY
  // -----------------------------

  async function toggleProduct(
    product: Product,
    field: "available" | "is_published",
  ) {
    const newValue = !product[field];

    const { error } = await supabase
      .from("products")
      .update({
        [field]: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, [field]: newValue } : item,
      ),
    );

    setMessage("Product updated.");
    router.refresh();
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  // -----------------------------
  // PRODUCT SEARCH
  // -----------------------------

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term)
    );
  });

  // -----------------------------
  // DASHBOARD UI
  // -----------------------------

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-8 text-[#29251f] sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#927b61]">
              Styled By Womenzone
            </p>

            <h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your orders and products.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm hover:bg-white"
          >
            Logout
          </button>
        </header>

        {/* TABS */}

        <div className="mb-6 flex gap-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "orders"
                ? "border-[#927b61] text-[#765d43]"
                : "border-transparent text-gray-500"
            }`}
          >
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === "products"
                ? "border-[#927b61] text-[#765d43]"
                : "border-transparent text-gray-500"
            }`}
          >
            Products ({products.length})
          </button>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
            {message}

            <button
              onClick={() => setMessage("")}
              className="float-right ml-4 text-gray-500"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* ORDERS TAB */}

        {activeTab === "orders" && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Customer Orders</h2>

            {orders.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                No orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#f2eee8] text-gray-600">
                    <tr>
                      <th className="p-4">Order</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-100">
                        <td className="p-4 font-medium">
                          {order.order_number}
                        </td>

                        <td className="p-4">
                          {order.customers?.full_name || "Customer"}

                          <p className="text-xs text-gray-500">
                            {order.customers?.phone || ""}
                          </p>
                        </td>

                        <td className="p-4">{formatDate(order.created_at)}</td>

                        <td className="p-4 font-medium">
                          {money(order.total)}
                        </td>

                        <td className="p-4">
                          <select
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus(order.id, event.target.value)
                            }
                            className="rounded-md border border-gray-300 bg-white px-2 py-2"
                          >
                            {[
                              "Pending",
                              "Confirmed",
                              "Processing",
                              "Shipped",
                              "Delivered",
                              "Cancelled",
                            ].map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-medium text-[#80674d] underline"
                          >
                            View order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* PRODUCTS TAB */}

        {activeTab === "products" && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Product Management</h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add, edit and manage your store products.
                </p>
              </div>

              <button
                onClick={startNewProduct}
                className="rounded-lg bg-[#29251f] px-5 py-3 text-sm font-medium text-white hover:bg-[#51483e]"
              >
                + Add Product
              </button>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="mb-5 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#927b61]"
            />

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-[#f2eee8] text-gray-600">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Brand</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Available</th>
                      <th className="p-4">Published</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-t border-gray-100">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-14 w-12 rounded-md bg-gray-100 object-cover"
                            />

                            <div>
                              <p className="font-medium">{product.name}</p>

                              <p className="text-xs text-gray-500">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">{product.brand}</td>

                        <td className="p-4 font-medium">
                          {money(product.price)}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => toggleProduct(product, "available")}
                            className={`rounded-full px-3 py-1 text-xs ${
                              product.available
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.available ? "Yes" : "No"}
                          </button>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() =>
                              toggleProduct(product, "is_published")
                            }
                            className={`rounded-full px-3 py-1 text-xs ${
                              product.is_published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {product.is_published ? "Published" : "Hidden"}
                          </button>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEditProduct(product)}
                              className="font-medium text-[#80674d] underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteProduct(product)}
                              className="font-medium text-red-600 underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ADD / EDIT PRODUCT MODAL */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-6 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit Product" : "Add New Product"}
                </h2>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-2xl text-gray-500"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-4">
                {/* BRAND */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Brand
                  </label>

                  <select
                    value={form.brand}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        brand: event.target.value as Product["brand"],
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  >
                    {BRANDS.map((brand) => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NAME AND CATEGORY */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Product name *
                    </label>

                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          name: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Category *
                    </label>

                    <input
                      required
                      value={form.category}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          category: event.target.value,
                        })
                      }
                      placeholder="e.g. Saree, Necklace"
                      className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    />
                  </div>
                </div>

                {/* PRICES */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price (৳) *
                    </label>

                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          price: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Original price (৳)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.original_price}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          original_price: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-3"
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Product description *
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  />
                </div>

                {/* IMAGE */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Product image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setImageFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm"
                  />

                  {form.image && !imageFile && (
                    <p className="mt-1 break-all text-xs text-gray-500">
                      Current image: {form.image}
                    </p>
                  )}

                  {imageFile && (
                    <p className="mt-1 text-xs text-green-700">
                      Selected: {imageFile.name}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    Choose a new image to replace the current one.
                  </p>
                </div>

                {/* BADGE */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Badge (optional)
                  </label>

                  <input
                    value={form.badge}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        badge: event.target.value,
                      })
                    }
                    placeholder="e.g. New Arrival, Best Seller"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  />
                </div>

                {/* OPTIONS */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Product options
                  </label>

                  <textarea
                    rows={3}
                    value={form.options}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        options: event.target.value,
                      })
                    }
                    placeholder={"One option per line\nGold\nSilver"}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  />
                </div>

                {/* SIZES */}

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Sizes
                  </label>

                  <textarea
                    rows={3}
                    value={form.size_options}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        size_options: event.target.value,
                      })
                    }
                    placeholder={"One size per line\nS\nM\nL"}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3"
                  />
                </div>

                {/* AVAILABILITY AND PUBLISHING */}

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          available: event.target.checked,
                        })
                      }
                    />
                    Available for purchase
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          is_published: event.target.checked,
                        })
                      }
                    />
                    Publish on website
                  </label>
                </div>

                {/* FORM BUTTONS */}

                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-300 px-5 py-3 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#29251f] px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Save Changes"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-6 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Order Details</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedOrder.order_number}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-2xl text-gray-500"
                  aria-label="Close order details"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Customer:</strong>{" "}
                  {selectedOrder.customers?.full_name || "—"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.customers?.phone || "—"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.customers?.email || "—"}
                </p>

                <p>
                  <strong>Date:</strong> {formatDate(selectedOrder.created_at)}
                </p>

                <p>
                  <strong>Address:</strong> {selectedOrder.full_address}
                </p>

                <p>
                  <strong>Area:</strong> {selectedOrder.delivery_area},{" "}
                  {selectedOrder.district}, {selectedOrder.division}
                </p>

                <p>
                  <strong>Payment:</strong> {selectedOrder.payment_method}
                </p>

                <p>
                  <strong>Notes:</strong> {selectedOrder.notes || "None"}
                </p>
              </div>

              <h3 className="mb-3 mt-6 font-semibold">Items</h3>

              <div className="space-y-3">
                {selectedOrder.order_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between gap-4 border-b border-gray-100 pb-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>

                      <p className="text-gray-500">
                        {item.brand} · {item.selected_option || "Standard"} ·
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="font-medium">{money(item.line_total)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <strong>{money(selectedOrder.subtotal)}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Delivery</span>
                  <strong>{money(selectedOrder.delivery_charge)}</strong>
                </p>

                <p className="flex justify-between text-base">
                  <span>Total</span>
                  <strong>{money(selectedOrder.total)}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-6 w-full rounded-lg bg-[#29251f] px-5 py-3 text-sm text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
