import { useEffect, useState } from "react";
import { LIMIT_OPTIONS } from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

interface PaymentOrder {
  id: number;
  total: number;
  user: {
    id: number;
    email: string;
  };
}

interface Payment {
  id: string;
  geteway: string;
  date: string;
  status: PaymentStatus;
  pidx: string;
  expires_at: string | null;
  order: PaymentOrder;
}

type SortField = "date" | "total" | "status" | "gateway";
type SortDir = "asc" | "desc";

const STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

const statusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SUCCESS: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const AdminPaymentsTab = () => {
  const { token } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [appliedOrderId, setAppliedOrderId] = useState("");
  const [buyerIdInput, setBuyerIdInput] = useState("");
  const [appliedBuyerId, setAppliedBuyerId] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [untilFilter, setUntilFilter] = useState("");

  // Sorting (client-side on current page)
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchPayments = () => {
    setLoading(true);
    setError(null);
    const params: Record<string, string | number> = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (appliedOrderId) params.orderId = Number(appliedOrderId);
    if (appliedBuyerId) params.buyerId = Number(appliedBuyerId);
    if (fromFilter) params.from = fromFilter;
    if (untilFilter) params.until = untilFilter;

    api
      .get<{ success: boolean; message: string; data: Payment[] }>(
        "/api/admin/payments",
        { headers: { Authorization: `Bearer ${token}` }, params },
      )
      .then((res) => {
        setPayments(res.data.data ?? []);
        setHasNextPage((res.data.data ?? []).length === limit);
      })
      .catch(() => setError("Failed to load payments. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    statusFilter,
    fromFilter,
    untilFilter,
    appliedOrderId,
    appliedBuyerId,
  ]);

  const handleApplyOrderId = () => {
    setAppliedOrderId(orderIdInput);
    setPage(1);
  };

  const handleApplyBuyerId = () => {
    setAppliedBuyerId(buyerIdInput);
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setOrderIdInput("");
    setAppliedOrderId("");
    setBuyerIdInput("");
    setAppliedBuyerId("");
    setFromFilter("");
    setUntilFilter("");
    setPage(1);
  };

  const hasActiveFilters =
    !!statusFilter ||
    !!appliedOrderId ||
    !!appliedBuyerId ||
    !!fromFilter ||
    !!untilFilter;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...payments].sort((a, b) => {
    let cmp = 0;
    if (sortField === "date") {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "total") {
      cmp = (a.order?.total ?? 0) - (b.order?.total ?? 0);
    } else if (sortField === "status") {
      cmp = a.status.localeCompare(b.status);
    } else if (sortField === "gateway") {
      cmp = (a.geteway ?? "").localeCompare(b.geteway ?? "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.order?.total ?? 0), 0);

  const successCount = payments.filter((p) => p.status === "SUCCESS").length;
  const failedCount = payments.filter(
    (p) => p.status === "FAILED" || p.status === "CANCELLED",
  ).length;

  const SortBtn = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-0.5 hover:text-gray-700 transition-colors"
    >
      {children}
      <span
        className={`ml-0.5 text-xs ${sortField === field ? "text-blue-500" : "text-gray-300"}`}
      >
        {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );

  return (
    <div>
      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as PaymentStatus | "");
                setPage(1);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Order ID</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyOrderId()}
                placeholder="e.g. 9"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleApplyOrderId}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
              >
                Go
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Buyer ID</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={buyerIdInput}
                onChange={(e) => setBuyerIdInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyBuyerId()}
                placeholder="e.g. 11"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleApplyBuyerId}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
              >
                Go
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={fromFilter}
              onChange={(e) => {
                setFromFilter(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Until</label>
            <input
              type="date"
              value={untilFilter}
              onChange={(e) => {
                setUntilFilter(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            ✕ Clear all filters
          </button>
        )}
      </div>

      {/* ── Summary cards ── */}
      {!loading && !error && payments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Total (page)</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {payments.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Successful</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {successCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Failed / Cancelled</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {failedCount}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400">Revenue (page)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₨{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          {!loading && !error && payments.length > 0 && (
            <>
              Sorted by{" "}
              <span className="font-medium text-gray-600">{sortField}</span> (
              {sortDir})
            </>
          )}
        </p>
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

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No payments found.
        </div>
      )}

      {/* ── Payments table ── */}
      {!loading && !error && payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_110px_90px_110px] gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
            <span>Payment / User</span>
            <SortBtn field="total">Amount</SortBtn>
            <SortBtn field="status">Status</SortBtn>
            <SortBtn field="gateway">Gateway</SortBtn>
            <SortBtn field="date">Date</SortBtn>
          </div>

          <div className="divide-y divide-gray-50">
            {sorted.map((payment, index) => (
              <div
                key={payment.id ?? index}
                className="grid grid-cols-1 sm:grid-cols-[1fr_120px_110px_90px_110px] gap-1 sm:gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Payment / User */}
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium text-gray-700 truncate">
                    {payment.id.slice(0, 8)}
                    <span className="text-gray-400">…</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Order #{payment.order?.id} ·{" "}
                    <span className="text-gray-500">
                      {payment.order?.user?.email}
                    </span>
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5 truncate">
                    PIDX: {payment.pidx}
                  </p>
                </div>

                {/* Amount */}
                <div className="flex sm:block items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400 w-20 shrink-0">
                    Amount
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    ₨{(payment.order?.total ?? 0).toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="flex sm:block items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400 w-20 shrink-0">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${statusColors[payment.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {payment.status}
                  </span>
                </div>

                {/* Gateway */}
                <div className="flex sm:block items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400 w-20 shrink-0">
                    Gateway
                  </span>
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {payment.geteway}
                  </span>
                </div>

                {/* Date */}
                <div className="flex sm:block items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400 w-20 shrink-0">
                    Date
                  </span>
                  <div>
                    <p className="text-xs text-gray-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && (hasNextPage || page > 1) && (
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
  );
};

export default AdminPaymentsTab;
