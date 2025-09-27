"use client";

import { useAuth } from "../components/AuthContext";
import Login from "../components/Login";
import EnhancedDashboard from "../components/EnhancedDashboard";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <EnhancedDashboard /> : <Login />;
}
