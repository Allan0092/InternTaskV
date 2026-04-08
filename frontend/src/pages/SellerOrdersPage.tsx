import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
  productId: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  Total: number;
  status: OrderStatus;
  paymentId: string | null;
  orderItems: OrderItem[];
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const STATUS_OPTIONS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipping", value: "SHIPPING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Declined", value: "DECLINED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPING: "bg-cyan-100 text-cyan-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const SellerOrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">(
    "ALL",
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = (status: OrderStatus | "ALL") => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    if (status !== "ALL") params.status = status;
    axios
      .get<{ success: boolean; data: Order[] }>(
        "http://localhost:3000/api/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        },
      )
      .then((res) => setOrders(res.data.data))
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders(selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            Orders containing your listed products
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedStatus === value
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
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
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={() => fetchOrders(selectedStatus)}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
            <p className="text-gray-500 font-medium text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {selectedStatus !== "ALL"
                ? `No orders with status "${selectedStatus}".`
                : "You have no orders yet."}
            </p>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-1">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Order header row */}
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
                      <p className="text-xs text-gray-400 truncate">
                        {new Date(order.orderDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Buyer:{" "}
                        <span className="font-medium text-gray-700">
                          {order.user.name}
                        </span>{" "}
                        <span className="text-gray-400">
                          ({order.user.email})
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-blue-600 text-base">
                        ₨{order.Total.toLocaleString()}
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

                  {/* Expanded order items */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Order Items
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

                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400">
                            SKU:{" "}
                            <span className="font-mono text-gray-500">
                              {order.sku}
                            </span>
                          </p>
                          {order.paymentId && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Payment:{" "}
                              <span className="font-mono text-gray-500">
                                {order.paymentId}
                              </span>
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-800">
                          Total: ₨{order.Total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;
