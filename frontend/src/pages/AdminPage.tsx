import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

type Role = "USER" | "SELLER" | "ADMIN";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  deletedAt: string | null;
}

interface PublicProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
  images: string[];
  userId: number;
  user: { name: string };
}

interface ProductsResponse {
  products: PublicProduct[];
  total: number;
  page: number;
  totalPages: number;
}

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED";

interface OrderItem {
  id: number;
  product: { id: number; name: string };
  price: number;
  quantity: number;
  status: OrderStatus;
}

interface AdminOrder {
  id: number;
  sku: string;
  buyerUserId: number;
  orderDate: string;
  Total: number;
  status: OrderStatus;
  paymentId: number | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  payments: null | unknown;
}

interface EditOrderForm {
  buyerUserId: number;
  orderDate: string;
  Total: number;
  status: OrderStatus;
  orderItems: { id: number; price: number; quantity: number }[];
}

type Tab = "users" | "products" | "orders";

const LIMIT_OPTIONS = [10, 20, 50];

const roleBadgeColors: Record<Role, string> = {
  USER: "bg-blue-100 text-blue-700",
  SELLER: "bg-green-100 text-green-700",
  ADMIN: "bg-red-100 text-red-700",
};

const orderStatusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
];

const AdminPage = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("users");

  // ── Users state ─────────────────────────────────────────────────
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [hasNextUserPage, setHasNextUserPage] = useState(false);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [restoringUser, setRestoringUser] = useState<number | null>(null);
  const [userActionError, setUserActionError] = useState<
    Record<number, string>
  >({});

  // ── Products state ───────────────────────────────────────────────
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [productLimit, setProductLimit] = useState(10);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);
  const [productActionError, setProductActionError] = useState<
    Record<number, string>
  >({});

  // ── Orders state ─────────────────────────────────────────────────
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(10);
  const [hasNextOrderPage, setHasNextOrderPage] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "">(
    "",
  );
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [editForm, setEditForm] = useState<EditOrderForm | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderActionError, setOrderActionError] = useState<string | null>(null);

  const fetchUsers = () => {
    setUsersLoading(true);
    setUsersError(null);
    api
      .get<{ success: boolean; data: AdminUser[] }>("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: userPage, limit: userLimit },
      })
      .then((res) => {
        setUsers(res.data.data);
        setHasNextUserPage(res.data.data.length === userLimit);
      })
      .catch(() => setUsersError("Failed to load users. Please try again."))
      .finally(() => setUsersLoading(false));
  };

  const fetchProducts = () => {
    setProductsLoading(true);
    setProductsError(null);
    api
      .get<{ success: boolean; data: ProductsResponse }>(
        "/api/public/products",
        {
          params: { page: productPage, limit: productLimit },
        },
      )
      .then((res) => {
        const { products, total, totalPages } = res.data.data;
        setProducts(products);
        setProductTotal(total);
        setProductTotalPages(totalPages);
      })
      .catch(() =>
        setProductsError("Failed to load products. Please try again."),
      )
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    if (tab === "users") fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, userPage, userLimit]);

  useEffect(() => {
    if (tab === "products") fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, productPage, productLimit]);

  const fetchOrders = () => {
    setOrdersLoading(true);
    setOrdersError(null);
    api
      .get<{ success: boolean; data: AdminOrder[] }>("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: orderPage,
          limit: orderLimit,
          ...(orderStatusFilter ? { status: orderStatusFilter } : {}),
        },
      })
      .then((res) => {
        setOrders(res.data.data);
        setHasNextOrderPage(res.data.data.length === orderLimit);
      })
      .catch(() => setOrdersError("Failed to load orders. Please try again."))
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    if (tab === "orders") fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, orderPage, orderLimit, orderStatusFilter]);

  const handleDeleteUser = async (userId: number) => {
    setDeletingUser(userId);
    setUserActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      setUserActionError((prev) => ({
        ...prev,
        [userId]: "Could not delete user.",
      }));
    } finally {
      setDeletingUser(null);
    }
  };

  const handleRestoreUser = async (userId: number) => {
    setRestoringUser(userId);
    setUserActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.patch(`/api/admin/users/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, deletedAt: null } : u)),
      );
    } catch {
      setUserActionError((prev) => ({
        ...prev,
        [userId]: "Could not restore user.",
      }));
    } finally {
      setRestoringUser(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    setDeletingProduct(productId);
    setProductActionError((prev) => ({ ...prev, [productId]: "" }));
    try {
      await api.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      setProductActionError((prev) => ({
        ...prev,
        [productId]: "Could not delete product.",
      }));
    } finally {
      setDeletingProduct(null);
    }
  };

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
    setOrderActionError(null);
  };

  const closeEditOrder = () => {
    setEditingOrder(null);
    setEditForm(null);
    setConfirmSaveOpen(false);
    setOrderActionError(null);
  };

  const handleQuickStatusUpdate = async () => {
    if (!editingOrder || !editForm) return;
    setUpdatingStatus(true);
    setOrderActionError(null);
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
      setOrderActionError("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveOrderDetails = async () => {
    if (!editingOrder || !editForm) return;
    setSavingOrder(true);
    setOrderActionError(null);
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
      setOrderActionError("Failed to save order details. Please try again.");
      setConfirmSaveOpen(false);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage users, products and orders
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {(["users", "products", "orders"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "users"
                  ? "Users"
                  : t === "products"
                    ? "Products"
                    : "Orders"}
              </button>
            ))}
          </div>

          {/* ── USERS TAB ── */}
          {tab === "users" && (
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {!usersLoading && !usersError && (
                    <>{users.length} users on this page</>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Per page</label>
                  <select
                    value={userLimit}
                    onChange={(e) => {
                      setUserLimit(Number(e.target.value));
                      setUserPage(1);
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
              {usersLoading && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-4 border-b border-gray-50"
                    >
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-24 ml-auto" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!usersLoading && usersError && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{usersError}</p>
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Table */}
              {!usersLoading && !usersError && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          ID
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          Name
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          Email
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          Role
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">
                          Joined
                        </th>
                        <th className="text-right px-5 py-3 font-semibold text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr
                          key={user.id}
                          className={`border-b border-gray-50 ${idx % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                        >
                          <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">
                            {user.id}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            {user.name}
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColors[user.role]}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {user.deletedAt ? (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                Deleted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {user.deletedAt ? (
                              <button
                                onClick={() => handleRestoreUser(user.id)}
                                disabled={restoringUser === user.id}
                                className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                              >
                                {restoringUser === user.id
                                  ? "Restoring…"
                                  : "Restore"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingUser === user.id}
                                className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                              >
                                {deletingUser === user.id
                                  ? "Deleting…"
                                  : "Delete"}
                              </button>
                            )}
                            {userActionError[user.id] && (
                              <p className="text-red-500 text-xs mt-1">
                                {userActionError[user.id]}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                      No users found.
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {!usersLoading && !usersError && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">Page {userPage}</span>
                  <button
                    onClick={() => setUserPage((p) => p + 1)}
                    disabled={!hasNextUserPage}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {tab === "products" && (
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {!productsLoading && !productsError && (
                    <>{productTotal} total products</>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Per page</label>
                  <select
                    value={productLimit}
                    onChange={(e) => {
                      setProductLimit(Number(e.target.value));
                      setProductPage(1);
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
              {productsLoading && (
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
              {!productsLoading && productsError && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{productsError}</p>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Product list */}
              {!productsLoading && !productsError && (
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
                          {product.price.toLocaleString()} · Stock:{" "}
                          {product.quantity}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingProduct === product.id}
                          className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                        >
                          {deletingProduct === product.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                        {productActionError[product.id] && (
                          <p className="text-red-500 text-xs mt-1">
                            {productActionError[product.id]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!productsLoading && !productsError && productTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {productPage} of {productTotalPages}
                  </span>
                  <button
                    onClick={() =>
                      setProductPage((p) => Math.min(productTotalPages, p + 1))
                    }
                    disabled={productPage === productTotalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            <div>
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <p className="text-sm text-gray-500">
                  {!ordersLoading && !ordersError && (
                    <>{orders.length} orders on this page</>
                  )}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => {
                        setOrderStatusFilter(
                          e.target.value as OrderStatus | "",
                        );
                        setOrderPage(1);
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
                      value={orderLimit}
                      onChange={(e) => {
                        setOrderLimit(Number(e.target.value));
                        setOrderPage(1);
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
              {ordersLoading && (
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
              {!ordersLoading && ordersError && (
                <div className="text-center py-12">
                  <p className="text-red-500 mb-4">{ordersError}</p>
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Table */}
              {!ordersLoading && !ordersError && (
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
              {!ordersLoading && !ordersError && (
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {orderPage}
                  </span>
                  <button
                    onClick={() => setOrderPage((p) => p + 1)}
                    disabled={!hasNextOrderPage}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT ORDER MODAL ── */}
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
              {orderActionError && (
                <p className="text-red-500 text-sm">{orderActionError}</p>
              )}

              {/* ── Status Section (no confirmation required) ── */}
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

              {/* ── Other Details (confirmation required) ── */}
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

export default AdminPage;
