import { useEffect, useState } from "react";
import {
  type AdminOrder,
  type EditOrderForm,
  LIMIT_OPTIONS,
  ORDER_STATUSES,
  type OrderStatus,
  orderStatusColors,
} from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

const AdminOrdersTab = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");

  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [editForm, setEditForm] = useState<EditOrderForm | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: AdminOrder[] }>("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      })
      .then((res) => {
        setOrders(res.data.data);
        setHasNextPage(res.data.data.length === limit);
      })
      .catch(() => setError("Failed to load orders. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]);

  const openEditOrder = (order: AdminOrder) => {
    setEditingOrder(order);
    setEditForm({
      buyerUserId: order.buyerUserId,
      orderDate: order.orderDate.slice(0, 10),
      Total: order.Total,
      status: order.status,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    setConfirmSaveOpen(false);
    setActionError(null);
  };

  const closeEditOrder = () => {
    setEditingOrder(null);
    setEditForm(null);
    setConfirmSaveOpen(false);
    setActionError(null);
  };

  const handleQuickStatusUpdate = async () => {
    if (!editingOrder || !editForm) return;
    setUpdatingStatus(true);
    setActionError(null);
    try {
      await api.patch(
        `/api/admin/orders/${editingOrder.id}`,
        { status: editForm.status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id ? { ...o, status: editForm.status } : o,
        ),
      );
      setEditingOrder((prev) =>
        prev ? { ...prev, status: editForm.status } : prev,
      );
    } catch {
      setActionError("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveOrderDetails = async () => {
    if (!editingOrder || !editForm) return;
    setSavingOrder(true);
    setActionError(null);
    try {
      const payload = {
        buyerUserId: editForm.buyerUserId,
        orderDate: new Date(editForm.orderDate).toISOString(),
        Total: editForm.Total,
        orderItems: editForm.orderItems,
      };
      await api.patch(`/api/admin/orders/${editingOrder.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                buyerUserId: editForm.buyerUserId,
                orderDate: new Date(editForm.orderDate).toISOString(),
                Total: editForm.Total,
                orderItems: o.orderItems.map((item) => {
                  const updated = editForm.orderItems.find(
                    (fi) => fi.id === item.id,
                  );
                  return updated
                    ? {
                        ...item,
                        price: updated.price,
                        quantity: updated.quantity,
                      }
                    : item;
                }),
              }
            : o,
        ),
      );
      setConfirmSaveOpen(false);
      closeEditOrder();
    } catch {
      setActionError("Failed to save order details. Please try again.");
      setConfirmSaveOpen(false);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <>
      <div>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-500">
            {!loading && !error && <>{orders.length} orders on this page</>}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OrderStatus | "");
                  setPage(1);
                }}
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
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
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
              >
                <div className="h-4 bg-gray-200 rounded w-8" />
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-200 rounded w-20 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    SKU
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Buyer ID
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Items
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-50 ${idx % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                      {order.id}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs max-w-35 truncate">
                      {order.sku}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {order.buyerUserId}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-800 font-medium">
                      ₨{order.Total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${orderStatusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditOrder(order)}
                        className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No orders found.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      {editingOrder && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                Edit Order{" "}
                <span className="text-gray-400 font-mono text-sm">
                  #{editingOrder.id}
                </span>
              </h2>
              <button
                onClick={closeEditOrder}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {actionError && (
                <p className="text-red-500 text-sm">{actionError}</p>
              )}

              {/* Status Section — immediate save, no confirmation */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
                  Order Status
                </p>
                <p className="text-xs text-blue-500 mb-3">
                  Status changes take effect immediately — no confirmation
                  needed.
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) =>
                        f ? { ...f, status: e.target.value as OrderStatus } : f,
                      )
                    }
                    className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleQuickStatusUpdate}
                    disabled={
                      updatingStatus || editForm.status === editingOrder.status
                    }
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                  >
                    {updatingStatus ? "Saving…" : "Update Status"}
                  </button>
                </div>
              </div>

              {/* Other Details — requires confirmation */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Order Details
                  <span className="ml-2 normal-case font-normal text-gray-400">
                    (requires confirmation to save)
                  </span>
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Buyer User ID
                      </label>
                      <input
                        type="number"
                        value={editForm.buyerUserId}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f
                              ? { ...f, buyerUserId: Number(e.target.value) }
                              : f,
                          )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Order Date
                      </label>
                      <input
                        type="date"
                        value={editForm.orderDate}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, orderDate: e.target.value } : f,
                          )
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Total (₨)
                    </label>
                    <input
                      type="number"
                      value={editForm.Total}
                      onChange={(e) =>
                        setEditForm((f) =>
                          f ? { ...f, Total: Number(e.target.value) } : f,
                        )
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Order items */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">
                      Order Items
                    </label>
                    <div className="space-y-2">
                      {editingOrder.orderItems.map((item, idx) => {
                        const formItem = editForm.orderItems.find(
                          (fi) => fi.id === item.id,
                        )!;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <span className="flex-1 text-xs text-gray-700 truncate">
                              {item.product.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-400">
                                Price
                              </label>
                              <input
                                type="number"
                                value={formItem.price}
                                onChange={(e) =>
                                  setEditForm((f) => {
                                    if (!f) return f;
                                    const items = f.orderItems.map((fi, i) =>
                                      i === idx
                                        ? {
                                            ...fi,
                                            price: Number(e.target.value),
                                          }
                                        : fi,
                                    );
                                    return { ...f, orderItems: items };
                                  })
                                }
                                className="w-20 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-400">
                                Qty
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={formItem.quantity}
                                onChange={(e) =>
                                  setEditForm((f) => {
                                    if (!f) return f;
                                    const items = f.orderItems.map((fi, i) =>
                                      i === idx
                                        ? {
                                            ...fi,
                                            quantity: Number(e.target.value),
                                          }
                                        : fi,
                                    );
                                    return { ...f, orderItems: items };
                                  })
                                }
                                className="w-14 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Confirmation dialog */}
                {confirmSaveOpen ? (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Are you sure?
                    </p>
                    <p className="text-xs text-amber-700 mb-4">
                      You are about to modify the details of order{" "}
                      <strong>#{editingOrder.id}</strong>. This action cannot be
                      undone automatically.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveOrderDetails}
                        disabled={savingOrder}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                      >
                        {savingOrder ? "Saving…" : "Yes, Save Changes"}
                      </button>
                      <button
                        onClick={() => setConfirmSaveOpen(false)}
                        disabled={savingOrder}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmSaveOpen(true)}
                    className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOrdersTab;
