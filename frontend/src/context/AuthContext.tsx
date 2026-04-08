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

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
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

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(parseToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const setUserId = (id: number) => {
    setUser((prev) => (prev ? { ...prev, id } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, token, setUserId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
