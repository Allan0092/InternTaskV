import { useRef, useState } from "react";
import api, { isAxiosError } from "../lib/Axios";

const CATEGORIES = ["ELECTRONICS", "FASHION", "HOME", "TOYS", "BOOKS", "FOOD"];
const LIMIT_OPTIONS = [6, 12, 24];

const categoryColors: Record<string, string> = {
  ELECTRONICS: "bg-blue-100 text-blue-700",
  FASHION: "bg-pink-100 text-pink-700",
  HOME: "bg-yellow-100 text-yellow-700",
  TOYS: "bg-purple-100 text-purple-700",
  BOOKS: "bg-orange-100 text-orange-700",
  FOOD: "bg-green-100 text-green-700",
};

export interface SellerProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  images: string[];
  createdAt: string;
  userId: number;
}

interface Props {
  products: SellerProduct[];
  loading: boolean;
  error: string | null;
  token: string | null;
  onRetry: () => void;
  onAddFirstProduct: () => void;
  onRefresh: () => void;
}

const SellerProductList = ({
  products,
  loading,
  error,
  token,
  onRetry,
  onAddFirstProduct,
  onRefresh,
}: Props) => {
  // ── Filter state ───────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [appliedMin, setAppliedMin] = useState<number | undefined>(undefined);
  const [appliedMax, setAppliedMax] = useState<number | undefined>(undefined);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Pagination state ───────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // ── Upload state ───────────────────────────────────────────────
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Edit state ─────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    category: CATEGORIES[0],
    quantity: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<number | null>(null);

  const activeFilterCount =
    (appliedMin !== undefined ? 1 : 0) +
    (appliedMax !== undefined ? 1 : 0) +
    appliedCategories.length;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const applyFilters = () => {
    setAppliedMin(minInput !== "" ? Number(minInput) : undefined);
    setAppliedMax(maxInput !== "" ? Number(maxInput) : undefined);
    setAppliedCategories(selectedCategories);
    setPage(1);
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setMinInput("");
    setMaxInput("");
    setSelectedCategories([]);
    setAppliedMin(undefined);
    setAppliedMax(undefined);
    setAppliedCategories([]);
    setPage(1);
    setDrawerOpen(false);
  };

  // ── Client-side filtering ──────────────────────────────────────
  const filtered = products.filter((p) => {
    if (appliedMin !== undefined && p.price < appliedMin) return false;
    if (appliedMax !== undefined && p.price > appliedMax) return false;
    if (appliedCategories.length > 0 && !appliedCategories.includes(p.category))
      return false;
    if (
      searchQuery.trim() &&
      !p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
      return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * limit, safePage * limit);

  // ── Edit product ───────────────────────────────────────────────
  const openEdit = (product: SellerProduct) => {
    setEditTarget(product.id);
    setEditForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      category: product.category,
      quantity: String(product.quantity),
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleEditSubmit = async (productId: number) => {
    setEditSaving(true);
    setEditError(null);
    try {
      const body: Record<string, string | number> = {};
      if (editForm.name.trim()) body.name = editForm.name.trim();
      if (editForm.description.trim())
        body.description = editForm.description.trim();
      if (editForm.price !== "") body.price = Number(editForm.price);
      if (editForm.quantity !== "") body.quantity = Number(editForm.quantity);
      if (editForm.category) body.category = editForm.category;

      await api.patch(`/api/products/${productId}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditSuccess(productId);
      setEditTarget(null);
      onRefresh();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setEditError(err.response.data.message);
      } else {
        setEditError("Failed to update product.");
      }
    } finally {
      setEditSaving(false);
    }
  };

  // ── Image upload ───────────────────────────────────────────────
  const handleUpload = async (productId: number) => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      uploadFiles.forEach((f) => fd.append("images", f));
      await api.put(`/api/products/${productId}/upload-images`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadSuccess(productId);
      setUploadFiles([]);
      setUploadTarget(null);
      onRefresh();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setUploadError(err.response.data.message);
      } else {
        setUploadError("Image upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="text-sm text-blue-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-gray-400 text-sm mb-4">No products yet.</p>
        <button
          onClick={onAddFirstProduct}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <>
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
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-500 cursor-pointer"
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">{products.length}</span>{" "}
          products
        </p>

        {/* Filter button */}
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

      {/* Empty filtered state */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-400 text-sm">
            No products match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-blue-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Image carousel (show first image) */}
              <div className="relative h-40 bg-gray-100 overflow-hidden group">
                <img
                  src={
                    !product.images[0] || product.images[0] === "default.jpg"
                      ? `https://placehold.co/400x300/e2e8f0/94a3b8?text=${encodeURIComponent(product.name)}`
                      : `http://localhost:3000/uploads/${product.images[0]}`
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Image count badge */}
                {product.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-md">
                    +{product.images.length - 1} more
                  </span>
                )}
                {product.quantity <= 3 && product.quantity > 0 && (
                  <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Only {product.quantity} left
                  </span>
                )}
                {product.quantity === 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                    {product.name}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                      categoryColors[product.category] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto mb-3">
                  <span className="text-blue-600 font-bold text-sm">
                    ₨{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Qty: {product.quantity}
                  </span>
                </div>

                {/* Upload images */}
                {uploadTarget === product.id ? (
                  <div className="space-y-2">
                    {uploadError && (
                      <p className="text-xs text-red-500">{uploadError}</p>
                    )}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl py-3 px-4 text-center cursor-pointer hover:border-blue-400 transition-colors text-xs text-gray-500 hover:text-blue-500"
                    >
                      {uploadFiles.length > 0
                        ? `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} selected`
                        : "Click to select images"}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setUploadFiles(
                          e.target.files ? Array.from(e.target.files) : [],
                        )
                      }
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpload(product.id)}
                        disabled={uploading || uploadFiles.length === 0}
                        className="flex-1 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                      >
                        {uploading ? "Uploading…" : "Upload"}
                      </button>
                      <button
                        onClick={() => {
                          setUploadTarget(null);
                          setUploadFiles([]);
                          setUploadError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : uploadSuccess === product.id ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Images uploaded!
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setUploadTarget(product.id);
                      setUploadFiles([]);
                      setUploadError(null);
                      setUploadSuccess(null);
                    }}
                    className="w-full py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors"
                  >
                    Upload Images
                  </button>
                )}

                {/* Edit product */}
                {editTarget === product.id ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                      Edit Product
                    </p>
                    {editError && (
                      <p className="text-xs text-red-500">{editError}</p>
                    )}
                    <input
                      type="text"
                      placeholder="Name"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      min={0}
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      min={0}
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Description"
                      value={editForm.description}
                      rows={2}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSubmit(product.id)}
                        disabled={editSaving}
                        className="flex-1 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
                      >
                        {editSaving ? "Saving…" : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setEditTarget(null);
                          setEditError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editSuccess === product.id ? (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Product updated!
                  </div>
                ) : (
                  <button
                    onClick={() => openEdit(product)}
                    className="mt-2 w-full py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                  >
                    Edit Product
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination + per-page */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === safePage
                ? "bg-blue-500 text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
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
    </>
  );
};

export default SellerProductList;
