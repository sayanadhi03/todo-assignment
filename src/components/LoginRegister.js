"use client";

import React, { useState } from "react";
import { useAuth } from "./AuthContext";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("acme");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          tenantSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto-login after successful registration
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.reload(); // Refresh to update auth context
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { email: "admin@acme.test", role: "Admin", tenant: "Acme" },
    { email: "user@acme.test", role: "Member", tenant: "Acme" },
    { email: "admin@globex.test", role: "Admin", tenant: "Globex" },
    { email: "user@globex.test", role: "Member", tenant: "Globex" },
  ];

  const fillTestAccount = (email) => {
    setEmail(email);
    setPassword("password");
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          📝 Multi-tenant Notes SaaS
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Login/Register Toggle */}
          <div className="flex mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md border ${
                isLogin
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              🔑 Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md border-l-0 border ${
                !isLogin
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              ➕ Register
            </button>
          </div>

          <form
            className="space-y-6"
            onSubmit={isLogin ? handleLogin : handleRegister}
          >
            {/* Tenant Selection (Register only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="tenant"
                  className="block text-sm font-medium text-gray-700"
                >
                  🏢 Company
                </label>
                <select
                  id="tenant"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="acme">Acme Corporation</option>
                  <option value="globex">Globex Corporation</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose which company you want to join
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                📧 Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={
                    isLogin ? "Enter your email" : "Enter any email address"
                  }
                />
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  You can use any email address to register
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                🔒 Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter password"
                />
              </div>
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  New users are created as Members (not Admins)
                </p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="text-red-400">⚠️</div>
                  <div className="ml-3 text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isLogin ? "🔑 Sign In" : "➕ Create Account"}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Test Accounts Section (Login only) */}
          {isLogin && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    🧪 Test accounts
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {testAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillTestAccount(account.email)}
                    className="w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{account.email}</div>
                        <div className="text-gray-600">
                          {account.tenant} • {account.role}
                        </div>
                      </div>
                      <div className="text-lg">
                        {account.role === "Admin" ? "👑" : "👤"}
                      </div>
                    </div>
                  </button>
                ))}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  All test passwords:{" "}
                  <code className="bg-gray-100 px-1 rounded">password</code>
                </p>
              </div>
            </div>
          )}

          {/* Registration Info */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                📋 Registration Info:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>
                  • New users are created as <strong>Members</strong>
                </li>
                <li>
                  • Only existing Admins can upgrade plans and manage users
                </li>
                <li>• You can join either Acme or Globex company</li>
                <li>• Each company has its own separate data</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
