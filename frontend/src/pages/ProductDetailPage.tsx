import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { categoryColors } from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  images: string[];
}

const IMG_BASE = "http://localhost:3000/uploads";

const getImgSrc = (product: Product, idx: number) => {
  const imgs = product.images.filter((img) => !!img);
  return `${IMG_BASE}/${imgs[idx % imgs.length]}`;
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carousel
  const [activeIdx, setActiveIdx] = useState(0);

  // Cart
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: Product }>(`/api/public/products/${id}`)
      .then((res) => {
        setProduct(res.data.data);
        setActiveIdx(0);
      })
      .catch(() => setError("Could not load product. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    if (!product) return;
    setAdding(true);
    setCartError(null);
    try {
      await api.patch(
        `/api/users/carts/${product.id}`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch {
      setCartError("Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error ?? "Product not found."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const realImages = product.images.filter((img) => !!img);
  const totalImgs = realImages.length || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* ── Image carousel ── */}
            <div className="relative bg-gray-50 flex flex-col items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r border-gray-100">
              {/* Main image */}
              <div className="relative w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-gray-100">
                <img
                  key={activeIdx}
                  src={getImgSrc(product, activeIdx)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Prev / Next */}
                {totalImgs > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveIdx((i) => (i - 1 + totalImgs) % totalImgs)
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow text-gray-700 flex items-center justify-center text-lg transition"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setActiveIdx((i) => (i + 1) % totalImgs)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow text-gray-700 flex items-center justify-center text-lg transition"
                    >
                      ›
                    </button>
                  </>
                )}
                {/* Stock badge */}
                {product.quantity === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                    Out of stock
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {totalImgs > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {realImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                        i === activeIdx
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={`${IMG_BASE}/${img}`}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Dot indicator */}
              {totalImgs > 1 && (
                <div className="flex gap-1.5">
                  {realImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === activeIdx ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Product info ── */}
            <div className="p-8 flex flex-col gap-5">
              {/* Category */}
              <span
                className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${
                  categoryColors[product.category] ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {product.category}
              </span>

              {/* Name */}
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>

              {/* Price */}
              <p className="text-3xl font-bold text-blue-600">
                ₨{product.price.toLocaleString()}
              </p>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Availability:</span>
                {product.quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({product.quantity} left)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>

              {/* Quantity selector + Add to Cart */}
              {product.quantity > 0 && (
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Qty:</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        −
                      </button>
                      <span className="px-4 py-1.5 text-sm font-semibold text-gray-800 border-x border-gray-200">
                        {qty}
                      </span>
                      <button
                        onClick={() =>
                          setQty((q) => Math.min(product.quantity, q + 1))
                        }
                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                      added
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60"
                    }`}
                  >
                    {adding
                      ? "Adding…"
                      : added
                        ? "✓ Added to Cart"
                        : "Add to Cart"}
                  </button>

                  {cartError && (
                    <p className="text-red-500 text-xs">{cartError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
