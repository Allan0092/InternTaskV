import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORIES, categoryColors, LIMIT_OPTIONS } from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";
import type { ProductSearch, ProductsSearchResponse } from "../types/Product";

// interface ProductSearch {
//   id: number;
//   images: string[];
//   name: string;
//   price: number;
//   description: string;
//   category: string;
//   quantity: number;
//   createdAt: string;
//   userId: number;
//   user: { name: string };
// }

const SearchPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<ProductSearch[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Carousel state
  const [carouselIdx, setCarouselIdx] = useState<Record<number, number>>({});
  const getImgIdx = (id: number) => carouselIdx[id] ?? 0;
  const getImgSrc = (product: ProductSearch, idx: number) => {
    const imgs = product.images.filter((img) => !!img);
    if (imgs.length === 0)
      return `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(product.name)}`;
    return `http://localhost:3000/uploads/${imgs[idx % imgs.length]}`;
  };
  const getRealImages = (product: ProductSearch) =>
    product.images.filter((img) => !!img);

  // Cart state
  const [qty, setQty] = useState<Record<number, number>>({});
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [addedTo, setAddedTo] = useState<number | null>(null);
  const [cartError, setCartError] = useState<Record<number, string>>({});

  const getQty = (id: number) => qty[id] ?? 1;

  const handleAddToCart = async (productId: number) => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    setAddingTo(productId);
    setCartError((prev) => ({ ...prev, [productId]: "" }));
    try {
      await api.patch(
        `/api/users/carts/${productId}`,
        { quantity: getQty(productId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAddedTo(productId);
      setTimeout(() => setAddedTo(null), 2000);
    } catch {
      setCartError((prev) => ({
        ...prev,
        [productId]: "Could not add to cart.",
      }));
    } finally {
      setAddingTo(null);
    }
  };

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Applied filter state (triggers fetch)
  const [appliedMin, setAppliedMin] = useState<number | undefined>(undefined);
  const [appliedMax, setAppliedMax] = useState<number | undefined>(undefined);
  const [appliedCategory, setAppliedCategory] = useState(initialCategory);

  const activeFilterCount =
    (appliedMin !== undefined ? 1 : 0) +
    (appliedMax !== undefined ? 1 : 0) +
    (appliedCategory !== "" ? 1 : 0);

  const applyFilters = () => {
    const minVal = minInput !== "" ? Number(minInput) : undefined;
    const maxVal = maxInput !== "" ? Number(maxInput) : undefined;
    setAppliedMin(minVal);
    setAppliedMax(maxVal);
    setAppliedCategory(selectedCategory);
    setPage(1);
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setMinInput("");
    setMaxInput("");
    setSelectedCategory("");
    setAppliedMin(undefined);
    setAppliedMax(undefined);
    setAppliedCategory("");
    setPage(1);
    setDrawerOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      page,
      limit,
    };
    if (appliedMin !== undefined) params.min = appliedMin;
    if (appliedMax !== undefined) params.max = appliedMax;
    if (appliedCategory !== "") params.category = appliedCategory;
    if (appliedSearch !== "") params.search = appliedSearch;

    api
      .get<{ success: boolean; data: ProductsSearchResponse }>(
        "/api/public/products",
        { params },
      )
      .then((res) => {
        const { products, total, totalPages } = res.data.data;
        setProducts(products);
        setTotal(total);
        setTotalPages(totalPages);
      })
      .catch(() => setError("Failed to load products. Please try again."))
      .finally(() => setLoading(false));
  }, [page, limit, appliedMin, appliedMax, appliedCategory, appliedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-400 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">Browse All Products</h1>
          <p className="text-blue-100">
            Search, filter and find exactly what you need.
          </p>
        </div>
      </div>

      {/* Filter drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Filter drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Filters</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
          {/* Price range */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Price Range (₨)
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={minInput}
                min={0}
                onChange={(e) => setMinInput(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxInput}
                min={0}
                onChange={(e) => setMaxInput(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Category
            </p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="w-4 h-4 border-gray-300 text-blue-500 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-blue-500 transition-colors">
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Search box */}
          <form
            onSubmit={handleSearch}
            className="relative flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 shrink-0">
            {!loading && !error && (
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">{total}</span>{" "}
                products
              </p>
            )}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-12 h-12 text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-12 h-12 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
              />
            </svg>
            <p className="text-gray-400 font-medium text-lg">
              No products found
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your filters.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
              >
                {/* Image carousel */}
                {(() => {
                  const real = getRealImages(product);
                  const idx = getImgIdx(product.id);
                  const hasMultiple = real.length > 1;
                  return (
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={getImgSrc(product, idx)}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {hasMultiple && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIdx((prev) => ({
                                ...prev,
                                [product.id]:
                                  (idx - 1 + real.length) % real.length,
                              }));
                            }}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCarouselIdx((prev) => ({
                                ...prev,
                                [product.id]: (idx + 1) % real.length,
                              }));
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          >
                            ›
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {real.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCarouselIdx((prev) => ({
                                    ...prev,
                                    [product.id]: i,
                                  }));
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                  i === idx ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {product.quantity <= 3 && product.quantity > 0 && (
                        <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Only {product.quantity} left
                        </span>
                      )}
                      {product.quantity === 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-semibold text-gray-800 text-sm leading-snug line-clamp-1 hover:text-blue-600 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                        categoryColors[product.category] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">
                      ₨{product.price.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      by {product.user?.name}
                    </span>
                  </div>
                  {cartError[product.id] && (
                    <p className="text-xs text-red-500 mt-2">
                      {cartError[product.id]}
                    </p>
                  )}
                  {(!user || user.role === "USER") && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        min={1}
                        max={product.quantity || 1}
                        value={getQty(product.id)}
                        onChange={(e) =>
                          setQty((prev) => ({
                            ...prev,
                            [product.id]: Math.max(1, Number(e.target.value)),
                          }))
                        }
                        disabled={product.quantity === 0}
                        className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-40"
                      />
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={
                          product.quantity === 0 || addingTo === product.id
                        }
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        {addedTo === product.id
                          ? "✓ Added!"
                          : addingTo === product.id
                            ? "Adding…"
                            : user
                              ? "Add to Cart"
                              : "Sign in to buy"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-blue-500 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
              <span className="text-sm text-gray-500">Per page</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {LIMIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
