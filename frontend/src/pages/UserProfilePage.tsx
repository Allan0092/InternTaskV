import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { isAxiosError } from "../lib/Axios";

type Section = "info" | "password" | "deactivate";

const UserProfilePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>("info");

  // ── Profile info ──────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoError(null);
    setInfoSuccess(false);
    try {
      await api.patch(
        "/api/users",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInfoSuccess(true);
      if (email !== user?.email) {
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 1500);
      } else {
        setTimeout(() => setInfoSuccess(false), 3000);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setInfoError(err.response.data.message);
      } else {
        setInfoError("Failed to update profile. Please try again.");
      }
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Change password ───────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch(
        "/api/users/change-password",
        { currentPassword, newPassword, confirmNewPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Deactivate account ────────────────────────────────────────
  const [confirmText, setConfirmText] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const CONFIRM_PHRASE = "deactivate";

  const handleDeactivate = async () => {
    setDeactivateError(null);
    setDeactivating(true);
    try {
      await api.delete("/api/users/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate("/");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setDeactivateError(err.response.data.message);
      } else {
        setDeactivateError("Failed to deactivate account. Please try again.");
      }
    } finally {
      setDeactivating(false);
    }
  };

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: "info", label: "Profile Info", icon: "👤" },
    { id: "password", label: "Change Password", icon: "🔒" },
    { id: "deactivate", label: "Deactivate Account", icon: "⚠️" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your account settings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar nav */}
          <nav className="flex sm:flex-col gap-2 sm:w-48 shrink-0">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors w-full ${
                  activeSection === s.id
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                <span>{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Content panel */}
          <div className="flex-1">
            {/* ── Profile Info ── */}
            {activeSection === "info" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                  Profile Info
                </h2>

                {infoSuccess && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                    {email !== user?.email
                      ? "Email updated. Signing you out…"
                      : "Profile updated successfully."}
                  </div>
                )}
                {infoError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {infoError}
                  </div>
                )}

                <form onSubmit={handleSaveInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={savingInfo}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {savingInfo ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Change Password ── */}
            {activeSection === "password" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-5">
                  Change Password
                </h2>

                {passwordSuccess && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                    Password changed. Signing you out…
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        {showCurrent ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        {showNew ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      {savingPassword ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Deactivate Account ── */}
            {activeSection === "deactivate" && (
              <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-red-600 mb-2">
                  Deactivate Account
                </h2>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  This will permanently deactivate your account. You will be
                  logged out and will not be able to sign in again. This action
                  cannot be undone.
                </p>

                {deactivateError && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {deactivateError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type{" "}
                      <span className="font-mono font-bold text-red-500">
                        {CONFIRM_PHRASE}
                      </span>{" "}
                      to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={CONFIRM_PHRASE}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                    />
                  </div>

                  <button
                    onClick={handleDeactivate}
                    disabled={confirmText !== CONFIRM_PHRASE || deactivating}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {deactivating ? "Deactivating…" : "Deactivate My Account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
