import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CATEGORIES,
  categoryColors,
  IMG_BASE,
  type ProductHomePage,
} from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

const getImgSrc = (product: ProductHomePage) => {
  const img = product.images.find((i) => !!i);
  return img
    ? `${IMG_BASE}/${img}`
    : `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name)}`;
};

const CATEGORY_META: Record<string, { icon: string; bg: string }> = {
  ELECTRONICS: { icon: "📱", bg: "from-blue-500 to-cyan-500" },
  FASHION: { icon: "👗", bg: "from-pink-500 to-rose-500" },
  HOME: { icon: "🏠", bg: "from-amber-500 to-orange-500" },
  TOYS: { icon: "🎮", bg: "from-purple-500 to-violet-500" },
  BOOKS: { icon: "📚", bg: "from-emerald-500 to-teal-500" },
  FOOD: { icon: "🍱", bg: "from-lime-500 to-green-500" },
};

const LOW_STOCK_THRESHOLD = 10;

const HomePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductHomePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [addedTo, setAddedTo] = useState<number | null>(null);
  const [cartError, setCartError] = useState<Record<number, string>>({});

  useEffect(() => {
    api
      .get<{
        success: boolean;
        message: string;
        data: { products: ProductHomePage[] };
      }>("/api/public/products", { params: { page: 1, limit: 50 } })
      .then((res) => setProducts(res.data.data.products))
      .catch(() => setFetchError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

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
        { quantity: 1 },
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

  const justAdded = products.slice(0, 8);
  const heroMain = products[0] ?? null;
  const heroSecondary = products.slice(1, 3);
  const sellingOut = products.filter(
    (p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD,
  );
  const byCategory = CATEGORIES.reduce(
    (acc, cat) => {
      const list = products.filter((p) => p.category === cat);
      if (list.length > 0) acc[cat] = list.slice(0, 4);
      return acc;
    },
    {} as Record<string, ProductHomePage[]>,
  );

  const stockBadge = (qty: number) => {
    if (qty === 0)
      return (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          Sold Out
        </span>
      );
    if (qty <= 5)
      return (
        <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          Only {qty} left
        </span>
      );
    return null;
  };

  const renderMiniCard = (product: ProductHomePage) => (
    <div
      key={product.id}
      className="w-52 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative h-40 bg-gray-50"
      >
        <img
          src={getImgSrc(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {stockBadge(product.quantity)}
      </Link>
      <div className="p-3">
        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-gray-800 text-sm line-clamp-1 hover:text-blue-600 transition-colors block"
        >
          {product.name}
        </Link>
        <p className="text-blue-600 font-bold mt-1 text-sm">
          ₨{product.price.toLocaleString()}
        </p>
        {cartError[product.id] && (
          <p className="text-red-500 text-xs mt-1">{cartError[product.id]}</p>
        )}
        {user?.role === "USER" && (
          <button
            onClick={() => handleAddToCart(product.id)}
            disabled={product.quantity === 0 || addingTo === product.id}
            className="mt-2 w-full py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            {addedTo === product.id
              ? "✓ Added!"
              : addingTo === product.id
                ? "Adding…"
                : product.quantity === 0
                  ? "Sold Out"
                  : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );

  const renderGridCard = (product: ProductHomePage) => (
    <div
      key={product.id}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative h-44 bg-gray-50"
      >
        <img
          src={getImgSrc(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {stockBadge(product.quantity)}
      </Link>
      <div className="p-4">
        <Link
          to={`/products/${product.id}`}
          className="font-semibold text-gray-800 text-sm line-clamp-1 hover:text-blue-600 transition-colors block"
        >
          {product.name}
        </Link>
        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-blue-600 font-bold">
            ₨{product.price.toLocaleString()}
          </span>
          {user?.role === "USER" && (
            <button
              onClick={() => handleAddToCart(product.id)}
              disabled={product.quantity === 0 || addingTo === product.id}
              className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-medium transition-colors"
            >
              {addedTo === product.id
                ? "✓"
                : addingTo === product.id
                  ? "…"
                  : product.quantity === 0
                    ? "×"
                    : "+ Add"}
            </button>
          )}
        </div>
        {cartError[product.id] && (
          <p className="text-red-500 text-xs mt-1">{cartError[product.id]}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
          <div className="grid grid-cols-3 gap-4 h-80">
            <div className="col-span-2 bg-gray-200 rounded-3xl" />
            <div className="flex flex-col gap-4">
              <div className="flex-1 bg-gray-200 rounded-2xl" />
              <div className="flex-1 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-52 h-64 bg-gray-200 rounded-2xl shrink-0"
              />
            ))}
          </div>
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 space-y-12 py-8">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        {heroMain && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large hero card */}
            <Link
              to={`/products/${heroMain.id}`}
              className="md:col-span-2 relative rounded-3xl overflow-hidden h-72 md:h-96 block group"
            >
              <img
                src={getImgSrc(heroMain)}
                alt={heroMain.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 max-w-md">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                    categoryColors[heroMain.category] ??
                    "bg-white/20 text-white"
                  }`}
                >
                  {heroMain.category}
                </span>
                <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight">
                  {heroMain.name}
                </h2>
                <p className="text-white/75 text-sm mt-1.5 line-clamp-2">
                  {heroMain.description}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-white text-xl font-bold">
                    ₨{heroMain.price.toLocaleString()}
                  </span>
                  <span className="px-4 py-1.5 bg-white text-blue-600 rounded-xl text-sm font-semibold group-hover:bg-blue-50 transition-colors">
                    Shop Now →
                  </span>
                </div>
              </div>
              {heroMain.quantity <= 5 && heroMain.quantity > 0 && (
                <span className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Only {heroMain.quantity} left!
                </span>
              )}
            </Link>

            {/* Secondary feature cards */}
            <div className="flex md:flex-col gap-4 h-48 md:h-96">
              {heroSecondary.length > 0 ? (
                heroSecondary.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="flex-1 relative rounded-2xl overflow-hidden min-h-28 md:min-h-0 block group"
                  >
                    <img
                      src={getImgSrc(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-3">
                      <p className="text-white font-semibold text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-white/80 font-bold text-sm">
                        ₨{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex-1 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-center p-4">
                  <div>
                    <p className="text-4xl mb-2">🛍️</p>
                    <p className="font-semibold">Discover More</p>
                    <Link
                      to="/search"
                      className="text-xs text-white/75 mt-1 block"
                    >
                      Browse All →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STATS BAR ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Products Available", value: `${products.length}+` },
            {
              label: "Categories",
              value: CATEGORIES.filter((c) => byCategory[c]).length.toString(),
            },
            { label: "Trusted Sellers", value: "Active" },
            { label: "Fast Delivery", value: "Always" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 text-center"
            >
              <p className="text-xl font-bold text-blue-600">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── JUST ADDED ──────────────────────────────────────────── */}
        {justAdded.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Just Added ✨
                </h2>
                <p className="text-sm text-gray-500">
                  Fresh arrivals in the store
                </p>
              </div>
              <Link
                to="/search"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                See All →
              </Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {justAdded.map(renderMiniCard)}
            </div>
          </section>
        )}

        {/* ── SELLING OUT FAST ────────────────────────────────────── */}
        {sellingOut.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Selling Out Fast 🔥
                </h2>
                <p className="text-sm text-gray-500">
                  Limited stock — grab yours before it's gone!
                </p>
              </div>
              <Link
                to="/search"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                See All →
              </Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {sellingOut.map(renderMiniCard)}
            </div>
          </section>
        )}

        {/* ── SHOP BY CATEGORY ────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat] ?? {
                icon: "🛍️",
                bg: "from-gray-400 to-gray-500",
              };
              const count = (byCategory[cat] ?? []).length;
              return (
                <Link
                  key={cat}
                  to={`/search?category=${cat}`}
                  className={`bg-linear-to-br ${meta.bg} rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 text-white hover:opacity-90 transition-opacity text-center`}
                >
                  <span className="text-3xl">{meta.icon}</span>
                  <p className="font-semibold text-sm">{cat}</p>
                  {count > 0 && (
                    <p className="text-white/70 text-xs">{count}+ items</p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── PER-CATEGORY ROWS ───────────────────────────────────── */}
        {CATEGORIES.filter((cat) => byCategory[cat]).map((cat) => (
          <section key={cat}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {CATEGORY_META[cat]?.icon ?? "🛍️"}
                </span>
                <h2 className="text-xl font-bold text-gray-800">{cat}</h2>
              </div>
              <Link
                to={`/search?category=${cat}`}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {byCategory[cat].map(renderGridCard)}
            </div>
          </section>
        ))}

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-gray-400 text-lg">
              No products available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
