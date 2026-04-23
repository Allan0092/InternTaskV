import { useState } from "react";
import AdminOrdersTab from "../components/AdminOrdersTab";
import AdminPaymentsTab from "../components/AdminPaymentsTab";
import AdminProductsTab from "../components/AdminProductsTab";
import AdminUsersTab from "../components/AdminUsersTab";

type Tab = "users" | "products" | "orders" | "payments";

const TAB_LABELS: Record<Tab, string> = {
  users: "Users",
  products: "Products",
  orders: "Orders",
  payments: "Payments",
};

const AdminPage = () => {
  const [tab, setTab] = useState<Tab>("users");

  return (
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
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                tab === t
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {tab === "users" && <AdminUsersTab />}
        {tab === "products" && <AdminProductsTab />}
        {tab === "orders" && <AdminOrdersTab />}
        {tab === "payments" && <AdminPaymentsTab />}
      </div>
    </div>
  );
};

export default AdminPage;
