import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { isAxiosError } from "../lib/Axios";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  total: number;
  status: OrderStatus;
  //   paymentId: string | null;
  orderItems: OrderItem[];
  payments: {
    id: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "CANCELLED";
  } | null;
}

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPING: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const statusSteps: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
];

const UserOrdersPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const newOrderId = searchParams.get("new")
    ? Number(searchParams.get("new"))
    : null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<Record<number, string>>({});
  const [paying, setPaying] = useState<number | null>(null);
  const [payError, setPayError] = useState<Record<number, string>>({});
  const [checkingStatus, setCheckingStatus] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<number, string>>(
    {},
  );

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: Order[] }>("/api/users/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;
        setOrders(data);
        // Auto-expand: prefer the new order from query param, else the latest order
        if (newOrderId && data.some((o) => o.id === newOrderId)) {
          setExpandedId(newOrderId);
        } else if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      })
      .catch(() => setError("Failed to load your orders. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCancel = async (orderId: number) => {
    setCancelling(orderId);
    setCancelError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      await api.delete(`/api/users/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
      );
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Could not cancel order.";
      setCancelError((prev) => ({ ...prev, [orderId]: msg }));
    } finally {
      setCancelling(null);
    }
  };

  const handlePay = async (orderId: number, sku: string) => {
    setPaying(orderId);
    setPayError((prev) => ({ ...prev, [orderId]: "" }));
    try {
      const res = await api.get<{
        success: boolean;
        data: { url: string };
      }>("/api/payment/", {
        headers: { Authorization: `Bearer ${token}` },
        params: { sku },
      });
      window.location.href = res.data.data.url;
    } catch {
      setPayError((prev) => ({
        ...prev,
        [orderId]: "Could not initiate payment. Please try again.",
      }));
    } finally {
      setPaying(null);
    }
  };

  const handleCheckStatus = async (orderId: number, sku: string) => {
    setCheckingStatus(orderId);
    try {
      const res = await api.get<{
        success: boolean;
        data: { status: string };
      }>("/api/payment/check", {
        headers: { Authorization: `Bearer ${token}` },
        params: { sku },
      });
      setPaymentStatus((prev) => ({
        ...prev,
        [orderId]: res.data.data.status,
      }));
    } catch {
      setPaymentStatus((prev) => ({
        ...prev,
        [orderId]: "Failed to fetch status.",
      }));
    } finally {
      setCheckingStatus(null);
    }
  };

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
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
          onClick={fetchOrders}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <svg
          className="w-14 h-14 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-gray-500 font-medium text-lg mb-1">No orders yet</p>
        <p className="text-gray-400 text-sm mb-6">
          Once you place an order, you'll see it here.
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
        <h1 className="text-2xl font-bold text-gray-800 mb-1">My Orders</h1>
        <p className="text-sm text-gray-400 mb-6">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>

        {newOrderId && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <span>✓</span>
            <span>
              Order <span className="font-semibold">#{newOrderId}</span> placed
              successfully!
            </span>
          </div>
        )}

        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const isCancellable = order.status === "PENDING";
            const isCancelledOrDeclined =
              order.status === "CANCELLED" || order.status === "DECLINED";
            const activeStep = statusSteps.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => toggleExpand(order.id)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 text-sm">
                        Order #{order.id}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-blue-600">
                      ₨{order.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.orderItems.length}{" "}
                      {order.orderItems.length === 1 ? "item" : "items"}
                    </p>
                    <svg
                      className={`w-4 h-4 text-gray-400 mt-1 ml-auto transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-5">
                    {/* Progress tracker */}
                    {!isCancelledOrDeclined && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Order Progress
                        </p>
                        <div className="flex items-center gap-0">
                          {statusSteps.map((step, idx) => {
                            const done = activeStep >= idx;
                            const isLast = idx === statusSteps.length - 1;
                            return (
                              <div
                                key={step}
                                className="flex items-center flex-1 last:flex-none"
                              >
                                <div className="flex flex-col items-center gap-1">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                      done
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-400"
                                    }`}
                                  >
                                    {done ? "✓" : idx + 1}
                                  </div>
                                  <span
                                    className={`text-xs font-medium ${done ? "text-blue-600" : "text-gray-400"}`}
                                  >
                                    {step.charAt(0) +
                                      step.slice(1).toLowerCase()}
                                  </span>
                                </div>
                                {!isLast && (
                                  <div
                                    className={`flex-1 h-0.5 mb-4 mx-1 ${
                                      activeStep > idx
                                        ? "bg-blue-400"
                                        : "bg-gray-200"
                                    }`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isCancelledOrDeclined && (
                      <div
                        className={`px-4 py-3 rounded-xl text-sm font-medium ${
                          order.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        This order was{" "}
                        {order.status === "CANCELLED"
                          ? "cancelled"
                          : "declined"}
                        .
                      </div>
                    )}

                    {/* Order items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Items
                      </p>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                <svg
                                  className="w-4 h-4 text-blue-300"
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
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Product #{item.productId}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-800">
                                ₨{(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                ₨{item.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: SKU + actions */}
                    <div className="pt-1 space-y-3">
                      <p className="text-xs text-gray-400">
                        SKU:{" "}
                        <span className="font-mono text-gray-500">
                          {order.sku}
                        </span>
                      </p>

                      {isCancellable && (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Pay Now — only if no payment initiated yet */}
                          {!order.payments && (
                            <button
                              onClick={() => handlePay(order.id, order.sku)}
                              disabled={paying === order.id}
                              className="flex-1 min-w-32 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                            >
                              {paying === order.id ? "Redirecting…" : "Pay Now"}
                            </button>
                          )}

                          {/* Check Payment Status — only if payment already initiated */}
                          {order.payments && (
                            <button
                              onClick={() =>
                                handleCheckStatus(order.id, order.sku)
                              }
                              disabled={checkingStatus === order.id}
                              className="flex-1 min-w-32 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                            >
                              {checkingStatus === order.id
                                ? "Checking…"
                                : "Check Payment Status"}
                            </button>
                          )}

                          {/* Cancel */}
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelling === order.id}
                            className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
                          >
                            {cancelling === order.id
                              ? "Cancelling…"
                              : "Cancel Order"}
                          </button>
                        </div>
                      )}

                      {/* Existing payment info from API */}
                      {order.payments && (
                        <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm flex items-center gap-2">
                          <span className="text-blue-500 font-medium">
                            Payment Status:
                          </span>
                          <span className="text-blue-700 font-semibold">
                            {order.payments.status}
                          </span>
                        </div>
                      )}

                      {/* Payment status from manual check */}
                      {paymentStatus[order.id] && (
                        <div className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm flex items-center gap-2">
                          <span className="text-blue-500 font-medium">
                            Latest Payment Status:
                          </span>
                          <span className="text-blue-700 font-semibold">
                            {paymentStatus[order.id]}
                          </span>
                        </div>
                      )}

                      {/* Pay error */}
                      {payError[order.id] && (
                        <p className="text-xs text-red-500">
                          {payError[order.id]}
                        </p>
                      )}

                      {/* Cancel error */}
                      {cancelError[order.id] && (
                        <p className="text-xs text-red-500">
                          {cancelError[order.id]}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserOrdersPage;
