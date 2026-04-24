import { useEffect, useRef, useState } from "react";
import SellerProductList, {
  type SellerProduct,
} from "../components/SellerProductList";
import { CATEGORIES } from "../constants";
import { useAuth } from "../context/AuthContext";
import api, { isAxiosError } from "../lib/Axios";

type Tab = "create" | "my-products";

const AddProductPage = () => {
  const { token, setUserId } = useAuth();
  const [tab, setTab] = useState<Tab>("create");

  // ── Create form state ──────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: CATEGORIES[0],
    quantity: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<{
    id: number;
  } | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // ── Image upload state ─────────────────────────────────────────
  const [uploadProductId, setUploadProductId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── My Products state ──────────────────────────────────────────
  const [myProducts, setMyProducts] = useState<SellerProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch seller products when tab switches or after create
  const fetchMyProducts = () => {
    setProductsLoading(true);
    setProductsError(null);
    api
      .get<{ success: boolean; data: SellerProduct[] }>("/api/products/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      })
      .then((res) => setMyProducts(res.data.data))
      .catch(() => setProductsError("Failed to load products."))
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    if (tab === "my-products") {
      fetchMyProducts();
    }
  }, [tab]);

  // Create product
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const res = await api.post<{
        success: boolean;
        data: Partial<SellerProduct> & { id?: number };
      }>(
        "/api/products/",
        {
          name: form.name,
          price: Number(form.price),
          description: form.description,
          category: form.category,
          quantity: Number(form.quantity),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCreateSuccess(true);
      const productId = res.data.data?.id ?? null;
      if (productId) {
        setCreatedProduct({ id: productId });
        setUploadProductId(productId);
      }
      if (res.data.data?.userId) {
        setUserId(res.data.data.userId);
      }
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setCreateError(err.response.data.message);
      } else {
        setCreateError("Failed to create product. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      description: "",
      category: CATEGORIES[0],
      quantity: "",
    });
    setCreateSuccess(false);
    setCreatedProduct(null);
    setUploadProductId(null);
    setSelectedFiles([]);
    setUploadError(null);
    setUploadSuccess(false);
  };

  // ── Image upload (new product) ─────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!uploadProductId || selectedFiles.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      selectedFiles.forEach((f) => fd.append("photo", f));
      await api.put(`/api/products/${uploadProductId}/upload-images`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadSuccess(true);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setUploadError(err.response.data.message);
      } else {
        setUploadError("Image upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Seller Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your products and listings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
          {(["create", "my-products"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "create" ? "Add New Product" : "My Products"}
            </button>
          ))}
        </div>

        {/* ── TAB: Create ──────────────────────────────────────── */}
        {tab === "create" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {!createSuccess ? (
              <>
                <h2 className="text-base font-semibold text-gray-800 mb-5">
                  Product Details
                </h2>
                {createError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {createError}
                  </div>
                )}
                <form onSubmit={handleCreate} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Lenovo Legion Pro"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Price & Quantity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price (₨)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        placeholder="e.g. 15000"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={form.quantity}
                        onChange={(e) =>
                          setForm({ ...form, quantity: e.target.value })
                        }
                        placeholder="e.g. 10"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Describe your product…"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-colors"
                  >
                    {creating ? "Creating…" : "Create Product"}
                  </button>
                </form>
              </>
            ) : (
              /* ── Success state ── */
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                  <svg
                    className="w-5 h-5 text-green-500 shrink-0"
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
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Product created successfully!
                    </p>
                    {createdProduct && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Product ID: #{createdProduct.id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image upload section */}
                {uploadProductId ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-1">
                      Upload Images{" "}
                      <span className="text-gray-400 font-normal">
                        (optional)
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                      Add images for product #{uploadProductId}
                    </p>

                    {uploadSuccess ? (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Images uploaded successfully!
                      </div>
                    ) : (
                      <>
                        {uploadError && (
                          <div className="mb-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            {uploadError}
                          </div>
                        )}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
                        >
                          <svg
                            className="w-8 h-8 text-gray-300 mx-auto mb-2"
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
                          {selectedFiles.length > 0 ? (
                            <p className="text-sm text-blue-600 font-medium">
                              {selectedFiles.length} file
                              {selectedFiles.length > 1 ? "s" : ""} selected
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-gray-500">
                                Click to browse images
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, WEBP supported
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        {selectedFiles.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedFiles.map((f, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg"
                              >
                                {f.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={handleUpload}
                            disabled={uploading || selectedFiles.length === 0}
                            className="flex-1 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                          >
                            {uploading ? "Uploading…" : "Upload Images"}
                          </button>
                          <button
                            onClick={resetForm}
                            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            Skip
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Switch to{" "}
                    <button
                      onClick={() => setTab("my-products")}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      My Products
                    </button>{" "}
                    to upload images to your new listing.
                  </p>
                )}

                <button
                  onClick={resetForm}
                  className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors"
                >
                  Add Another Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: My Products ─────────────────────────────────── */}
        {tab === "my-products" && (
          <div>
            <SellerProductList
              products={myProducts}
              loading={productsLoading}
              error={productsError}
              token={token}
              onRetry={fetchMyProducts}
              onAddFirstProduct={() => setTab("create")}
              onRefresh={fetchMyProducts}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default AddProductPage;
