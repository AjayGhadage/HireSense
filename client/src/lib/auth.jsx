import { createContext, useContext, useState, useCallback } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("hs_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: u } = res.data;
    localStorage.setItem("hs_token", token);
    localStorage.setItem("hs_user", JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (full_name, email, password) => {
    await api.post("/auth/register", { full_name, email, password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("hs_token");
    localStorage.removeItem("hs_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
