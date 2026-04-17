import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleBadgeColors = {
  USER: "bg-blue-100 text-blue-700",
  SELLER: "bg-green-100 text-green-700",
  ADMIN: "bg-red-100 text-red-700",
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, notifications, clearNotifications } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-blue-500 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="text-white text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
        >
          The Real Daraz
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            to="/"
            className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
          >
            Home
          </Link>

          {/* Cart icon for logged-in users */}
          {user && (
            <Link
              to="/cart"
              className="relative text-blue-100 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
              aria-label="Cart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                />
              </svg>
            </Link>
          )}

          {/* SELLER: Add Product */}
          {user?.role === "SELLER" && (
            <Link
              to="/products/new"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
            >
              My Products
            </Link>
          )}

          {/* USER: My Orders */}
          {user?.role === "USER" && (
            <Link
              to="/my-orders"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
            >
              My Orders
            </Link>
          )}

          {/* SELLER: Orders */}
          {user?.role === "SELLER" && (
            <Link
              to="/orders"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
            >
              Orders
            </Link>
          )}

          {/* ADMIN: Admin Panel */}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin"
              className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
            >
              Admin Panel
            </Link>
          )}

          {/* Unauthenticated */}
          {!user && (
            <>
              <Link
                to="/login"
                className="text-blue-100 hover:text-white text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-500 hover:bg-blue-50 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}

          {/* Authenticated: user menu */}
          {user && (
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="relative text-blue-100 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-blue-600"
                  aria-label="Notifications"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>

                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">
                          Notifications
                        </p>
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          Clear
                        </button>
                      </div>

                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-gray-400 text-center">
                          No new notifications.
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification, index) => (
                            <div
                              key={`${notification.timestamp}-${index}`}
                              className="px-4 py-3"
                            >
                              <p className="text-sm text-gray-700">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.timestamp,
                                ).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium hidden sm:block max-w-25 truncate">
                    {user.name}
                  </span>
                  <svg
                    className="w-3 h-3 text-blue-200"
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
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                        <span
                          className={`mt-1.5 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColors[user.role]}`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
