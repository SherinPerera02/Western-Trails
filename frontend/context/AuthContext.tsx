"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "tourist" | "admin";
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on page load
  useEffect(() => {
    const token = localStorage.getItem("wt_token");
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    api
      .get("/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("wt_token"))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (token: string, u: User) => {
    localStorage.setItem("wt_token", token);
    setUser(u);
    return u;
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    return saveSession(res.data.token, res.data.user);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post("/register", data);
    return saveSession(res.data.token, res.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("wt_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
