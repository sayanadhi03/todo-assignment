"use client";

import React from "react";
import { useAuth } from "./AuthContext";

const DebugInfo = () => {
  const { user, token } = useAuth();

  if (!user) {
    return (
      <div className="p-4 bg-red-100 text-red-800">No user data found</div>
    );
  }

  return (
    <div className="p-4 bg-blue-100 text-blue-800 mb-4">
      <h3 className="font-bold">Debug Info:</h3>
      <pre className="text-xs mt-2">{JSON.stringify(user, null, 2)}</pre>
      <p className="mt-2">Token exists: {token ? "Yes" : "No"}</p>
    </div>
  );
};

export default DebugInfo;
