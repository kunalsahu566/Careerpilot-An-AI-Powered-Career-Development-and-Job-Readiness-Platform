import { createContext, useContext, useState, useEffect } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("careerpilot_token");
    const savedUser = localStorage.getItem("careerpilot_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function register(name, email, password) {
    const res = await apiClient.post("/auth/register", { name, email, password });
    saveSession(res.data);
  }

  async function login(email, password) {
    const res = await apiClient.post("/auth/login", { email, password });
    saveSession(res.data);
  }

  function saveSession(data) {
    localStorage.setItem("careerpilot_token", data.access_token);
    localStorage.setItem("careerpilot_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("careerpilot_token");
    localStorage.removeItem("careerpilot_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}