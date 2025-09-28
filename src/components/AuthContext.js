"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        // Check if token is expired by parsing it (basic check)
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          // Token is expired, clear it
          console.log("Token expired, clearing stored auth data");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error parsing stored auth data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setToken(data.accessToken);
      setUser(data.user);

      // Store in localStorage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Helper function to make authenticated API requests
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
      },
    });

    // If token expired, clear auth data and redirect to login
    if (response.status === 401) {
      const errorData = await response.text();
      if (errorData.includes("expired") || errorData.includes("TokenExpiredError")) {
        console.log("Token expired, logging out");
        logout();
        return null;
      }
    }

    return response;
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    authenticatedFetch,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
