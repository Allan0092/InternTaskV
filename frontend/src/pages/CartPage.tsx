import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

interface CartProduct {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    quantity: number;
  };
  quantity: number;
}

interface Cart {
  sku: string;
  cartProducts: CartProduct[];
}

const CartPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = () => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: Cart }>("/api/users/carts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCart(res.data.data))
      .catch(() => setError("Failed to load your cart. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [removing, setRemoving] = useState<number | null>(null);
  const [updatingQty, setUpdatingQty] = useState<number | null>(null);
  const [qtyError, setQtyError] = useState<Record<number, string>>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setOrderError(null);
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        data: { orderId?: number };
      }>(
        "/api/users/orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success && res.data.data.orderId) {
        navigate(`/my-orders?new=${res.data.data.orderId}`);
      } else {
        setOrderError(res.data.message ?? "Could not place order.");
      }
    } catch {
      setOrderError("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleRemove = async (cartProductId: number) => {
    setRemoving(cartProductId);
    try {
      await api.delete(`/api/users/carts/${cartProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) =>
        prev
          ? {
              ...prev,
              cartProducts: prev.cartProducts.filter(
                (item) => item.id !== cartProductId,
              ),
            }
          : prev,
      );
    } catch {
      // silently ignore; user can retry
    } finally {
      setRemoving(null);
    }
  };

  const handleUpdateQuantity = async (item: CartProduct, nextQty: number) => {
    const maxQty = Math.max(1, item.product.quantity);
    const safeQty = Math.max(1, Math.min(nextQty, maxQty));
    if (safeQty === item.quantity) return;

    setUpdatingQty(item.id);
    setQtyError((prev) => ({ ...prev, [item.id]: "" }));

    try {
      await api.patch(
        `/api/users/carts/${item.product.id}`,
        { quantity: safeQty },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCart((prev) =>
        prev
          ? {
              ...prev,
              cartProducts: prev.cartProducts.map((cp) =>
                cp.id === item.id ? { ...cp, quantity: safeQty } : cp,
              ),
            }
          : prev,
      );
    } catch {
      setQtyError((prev) => ({
        ...prev,
        [item.id]: "Could not update quantity. Please try again.",
      }));
    } finally {
      setUpdatingQty(null);
    }
  };

  const total = (cart?.cartProducts ?? []).reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse flex gap-4"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4">
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
        <p className="text-red-500 font-medium mb-4">{error}</p>
        <button
          onClick={fetchCart}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const items = cart?.cartProducts ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mb-4"
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
        <h2 className="text-xl font-bold text-gray-700 mb-1">
          Your cart is empty
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Browse products and add something you like!
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart</h1>
        <p className="text-sm text-gray-400 mb-6">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm"
            >
              {/* Icon placeholder */}
              <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7 text-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
                  {item.product.name}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                  {item.product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-600 font-bold">
                    ₨{item.product.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Qty:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity - 1)
                        }
                        disabled={updatingQty === item.id || item.quantity <= 1}
                        className="px-2.5 py-0.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-0.5 text-sm font-semibold text-gray-700 border-x border-gray-200 min-w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity + 1)
                        }
                        disabled={
                          updatingQty === item.id ||
                          item.quantity >= Math.max(1, item.product.quantity)
                        }
                        className="px-2.5 py-0.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Available stock: {item.product.quantity}
                </p>
                {qtyError[item.id] && (
                  <p className="text-xs text-red-500 mt-1">
                    {qtyError[item.id]}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0 flex flex-col items-end gap-2">
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removing === item.id}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors"
                  aria-label="Remove item"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <p className="text-xs text-gray-400">Subtotal</p>
                <p className="font-bold text-gray-800">
                  ₨{(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-500 truncate max-w-50">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="text-gray-700 font-medium">
                  ₨{(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {orderError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {orderError}
            </div>
          )}
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-xl font-bold text-blue-600">
              ₨{total.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="mt-5 w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-colors"
          >
            {placingOrder ? "Placing Order…" : "Proceed to Checkout"}
          </button>
          <Link
            to="/"
            className="mt-2 block text-center text-sm text-blue-500 hover:text-blue-600 py-2 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
