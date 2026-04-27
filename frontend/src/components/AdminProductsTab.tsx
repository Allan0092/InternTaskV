import { useEffect, useState } from "react";
import { CATEGORIES, IMG_BASE, LIMIT_OPTIONS } from "../constants";
import { useAuth } from "../context/AuthContext";
import api, { isAxiosError } from "../lib/Axios";
import type { ProductsResponse, PublicProduct } from "../types/Product";

const AdminProductsTab = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});

  // ── Edit modal ────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<PublicProduct | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const openEdit = (product: PublicProduct) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      quantity: String(product.quantity),
    });
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const res = await api.patch<{ success: boolean; message: string }>(
        `/api/admin/products/${editingProduct.id}`,
        {
          name: editForm.name,
          price: Number(editForm.price),
          description: editForm.description,
          category: editForm.category,
          quantity: Number(editForm.quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        setEditSuccess(res.data.message || "Product updated successfully.");
        setTimeout(() => {
          closeEdit();
          fetchProducts();
        }, 1500);
      } else {
        setEditError(res.data.message || "Failed to save changes.");
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setEditError(err.response.data.message);
      } else {
        setEditError("Failed to save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: ProductsResponse }>(
        "/api/public/products",
        {
          params: { page, limit },
        },
      )
      .then((res) => {
        const { products: data, total: t, totalPages: tp } = res.data.data;
        setProducts(data);
        setTotal(t);
        setTotalPages(tp);
      })
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProduct(productId);
    setActionError((prev) => ({ ...prev, [productId]: "" }));
    try {
      await api.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      setActionError((prev) => ({
        ...prev,
        [productId]: "Could not delete product.",
      }));
    } finally {
      setDeletingProduct(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {!loading && !error && <>{total} total products</>}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Per page</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4"
            >
              <div className="h-14 w-14 bg-gray-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product list */}
      {!loading && !error && (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No products found.
            </div>
          )}
          {products.map((product, index) => (
            <div
              key={product.id ?? index}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              {product.images?.[0] ? (
                <img
                  src={`${IMG_BASE}/${product.images[0]}`}
                  alt={product.name}
                  className="h-14 w-14 rounded-lg object-cover shrink-0 bg-gray-100"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  ID: {product.id} · Seller: {product.user?.name} · ₨
                  {(product.price ?? 0).toLocaleString()} · Stock:{" "}
                  {product.quantity}
                </p>
              </div>
              <div className="shrink-0 text-right flex flex-col items-end gap-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingProduct === product.id}
                    className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                  >
                    {deletingProduct === product.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
                {actionError[product.id] && (
                  <p className="text-red-500 text-xs">
                    {actionError[product.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeEdit} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">
                  Edit Product
                </h3>
                <button
                  onClick={closeEdit}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                {editSuccess && (
                  <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                    {editSuccess}
                  </div>
                )}
                {editError && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {editError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₨)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProductsTab;
