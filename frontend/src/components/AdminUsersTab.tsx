import { useEffect, useState } from "react";
import { type AdminUser, LIMIT_OPTIONS, roleBadgeColors } from "../constants";
import { useAuth } from "../context/AuthContext";
import api from "../lib/Axios";

const AdminUsersTab = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [deletingUser, setDeletingUser] = useState<number | null>(null);
  const [restoringUser, setRestoringUser] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    api
      .get<{ success: boolean; data: AdminUser[] }>("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      })
      .then((res) => {
        setUsers(res.data.data);
        setHasNextPage(res.data.data.length === limit);
      })
      .catch(() => setError("Failed to load users. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleDeleteUser = async (userId: number) => {
    setDeletingUser(userId);
    setActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      setActionError((prev) => ({
        ...prev,
        [userId]: "Could not delete user.",
      }));
    } finally {
      setDeletingUser(null);
    }
  };

  const handleRestoreUser = async (userId: number) => {
    setRestoringUser(userId);
    setActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.patch(`/api/admin/users/${userId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, deletedAt: null } : u)),
      );
    } catch {
      setActionError((prev) => ({
        ...prev,
        [userId]: "Could not restore user.",
      }));
    } finally {
      setRestoringUser(null);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {!loading && !error && <>{users.length} users on this page</>}
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

      {/* Loading skeleton */}
      {loading && (
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
      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
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
                  <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
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
                        {restoringUser === user.id ? "Restoring…" : "Restore"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deletingUser === user.id}
                        className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                      >
                        {deletingUser === user.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                    {actionError[user.id] && (
                      <p className="text-red-500 text-xs mt-1">
                        {actionError[user.id]}
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
  );
};

export default AdminUsersTab;
