// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api"; // Import the named export

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  // DERIVED STATE: isAuthenticated
  const isAuthenticated = !!user;

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoadingAuth(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const res = await api.get("/auth/me");
      const userData = res.data.user;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.warn("Not logged in or token invalid:", err.message);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      const { token, user: newUser } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(newUser);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (err) {
      console.warn("Logout API failed:", err.message);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Safe setUser to avoid loops
  const setUserSafe = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // Cross-tab sync (logout in one tab → all tabs)
  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "user" && !event.newValue) {
        setUser(null);
      }
    };
    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

  const value = {
    user,
    isAuthenticated,      // NOW PROVIDED
    loadingAuth,
    login,
    register,
    logout,
    fetchMe,
    setUser: setUserSafe,
  };

  return (
    <AuthContext.Provider value={value}>
      {loadingAuth ? (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-cyan-400 text-xl font-mono animate-pulse tracking-widest">
            AUTHENTICATING GRID ACCESS...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);