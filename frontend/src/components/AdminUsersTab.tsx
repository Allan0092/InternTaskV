import { useEffect, useState } from "react";
import {
  type AdminUser,
  type Role,
  LIMIT_OPTIONS,
  roleBadgeColors,
} from "../constants";
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
  const [disablingUser, setDisablingUser] = useState<number | null>(null);
  const [actionError, setActionError] = useState<Record<number, string>>({});
  const [confirmModal, setConfirmModal] = useState<{
    userId: number;
    userName: string;
    action: "delete" | "restore" | "disable";
  } | null>(null);
  const [editModal, setEditModal] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: Role;
  }>({
    name: "",
    email: "",
    role: "USER",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleDisableUser = async (userId: number) => {
    setDisablingUser(userId);
    setActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.delete(`/api/admin/users/${userId}/deactivate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, deletedAt: new Date().toISOString() } : u,
        ),
      );
    } catch {
      setActionError((prev) => ({
        ...prev,
        [userId]: "Could not disable user.",
      }));
    } finally {
      setDisablingUser(null);
    }
  };

  const handleRestoreUser = async (userId: number) => {
    setRestoringUser(userId);
    setActionError((prev) => ({ ...prev, [userId]: "" }));
    try {
      await api.patch(`/api/admin/users/${userId}/enable`, null, {
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

  const handleEditUser = async () => {
    if (!editModal) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      await api.patch(`/api/admin/users/${editModal.id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === editModal.id ? { ...u, ...editForm } : u)),
      );
      setEditModal(null);
    } catch {
      setEditError("Could not update user. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirm = () => {
    if (!confirmModal) return;
    if (confirmModal.action === "delete") handleDeleteUser(confirmModal.userId);
    else if (confirmModal.action === "disable")
      handleDisableUser(confirmModal.userId);
    else handleRestoreUser(confirmModal.userId);
    setConfirmModal(null);
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
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setEditModal(user);
                          setEditForm({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                          });
                          setEditError(null);
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>

                      {user.deletedAt ? (
                        /* Restore */
                        <button
                          onClick={() =>
                            setConfirmModal({
                              userId: user.id,
                              userName: user.name,
                              action: "restore",
                            })
                          }
                          disabled={restoringUser === user.id}
                          className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                        >
                          {restoringUser === user.id ? "Restoring…" : "Restore"}
                        </button>
                      ) : (
                        <>
                          {/* Disable */}
                          <button
                            onClick={() =>
                              setConfirmModal({
                                userId: user.id,
                                userName: user.name,
                                action: "disable",
                              })
                            }
                            disabled={disablingUser === user.id}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                          >
                            {disablingUser === user.id
                              ? "Disabling…"
                              : "Disable"}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() =>
                              setConfirmModal({
                                userId: user.id,
                                userName: user.name,
                                action: "delete",
                              })
                            }
                            disabled={deletingUser === user.id}
                            className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-xs font-medium transition-colors"
                          >
                            {deletingUser === user.id ? "Deleting…" : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                    {actionError[user.id] && (
                      <p className="text-red-500 text-xs mt-1 text-right">
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
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              {confirmModal.action === "delete"
                ? "Delete User"
                : confirmModal.action === "disable"
                  ? "Disable User"
                  : "Restore User"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to{" "}
              <span className="font-medium text-gray-700">
                {confirmModal.action}
              </span>{" "}
              user{" "}
              <span className="font-medium text-gray-700">
                {confirmModal.userName}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  confirmModal.action === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : confirmModal.action === "disable"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {confirmModal.action === "delete"
                  ? "Yes, Delete"
                  : confirmModal.action === "disable"
                    ? "Yes, Disable"
                    : "Yes, Restore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Edit User —{" "}
              <span className="text-gray-500 font-normal">#{editModal.id}</span>
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role: e.target.value as Role }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="USER">USER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            {editError && (
              <p className="text-red-500 text-xs mt-3">{editError}</p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {savingEdit ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
