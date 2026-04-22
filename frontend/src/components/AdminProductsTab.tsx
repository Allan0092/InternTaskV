import { useEffect, useState } from "react";
import {
  LIMIT_OPTIONS,
  type ProductsResponse,
  type PublicProduct,
} from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

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
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
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
                  {product.price.toLocaleString()} · Stock: {product.quantity}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={deletingProduct === product.id}
                  className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                >
                  {deletingProduct === product.id ? "Deleting…" : "Delete"}
                </button>
                {actionError[product.id] && (
                  <p className="text-red-500 text-xs mt-1">
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
    </div>
  );
};

export default AdminProductsTab;
