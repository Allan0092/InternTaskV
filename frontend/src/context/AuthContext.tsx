import { jwtDecode } from "jwt-decode";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "USER" | "SELLER" | "ADMIN";

interface TokenPayload {
  id?: number;
  name: string;
  email: string;
  role: Role;
  exp: number;
}

interface AuthUser {
  id?: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserNotification {
  type:
    | "NEW_ORDER_FOR_SELLER"
    | "ORDER_ITEM_STATUS_UPDATED"
    | "ORDER_STATUS_UPDATED";
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  notifications: UserNotification[];
  clearNotifications: () => void;
  /** Call after a product fetch/create to cache the seller's userId */
  setUserId: (id: number) => void;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "auth_token";

const parseToken = (token: string): AuthUser | null => {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    if (payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? parseToken(stored) : null;
  });
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  useEffect(() => {
    if (token) {
      const parsed = parseToken(token);
      if (parsed) {
        setUser(parsed);
      } else {
        // Token expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
    if (!baseUrl) return;

    const sseUrl = new URL("/api/notifications/stream", baseUrl);
    sseUrl.searchParams.set("token", token);

    const eventSource = new EventSource(sseUrl.toString());

    eventSource.addEventListener("notification", (event) => {
      try {
        const payload = JSON.parse(
          (event as MessageEvent).data,
        ) as UserNotification;
        setNotifications((prev) => [payload, ...prev].slice(0, 50));
      } catch {
        // Ignore malformed payloads to keep stream alive.
      }
    });

    return () => {
      eventSource.close();
    };
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(parseToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setNotifications([]);
  };

  const setUserId = (id: number) => {
    setUser((prev) => (prev ? { ...prev, id } : prev));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        notifications,
        clearNotifications,
        setUserId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
