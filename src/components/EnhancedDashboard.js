"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const EnhancedDashboard = () => {
  const { user, token, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const apiCall = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Request failed");
    }

    return response.json();
  };

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notes", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Request failed");
        }

        const data = await response.json();
        setNotes(data.notes);
        setError("");
      } catch (err) {
        setError("Failed to fetch notes");
        console.error("Fetch notes error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadNotes();
    }
  }, [token]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      const data = await apiCall("/api/notes", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setNotes([data.note, ...notes]);
      setFormData({ title: "", content: "" });
      setShowCreateForm(false);
      setError("");
    } catch (err) {
      if (err.message.includes("Plan limit reached")) {
        setError(
          `${err.message} ${
            user.role === "Admin"
              ? "You can upgrade to Pro plan."
              : "Ask your admin to upgrade to Pro plan."
          }`
        );
      } else {
        setError("Failed to create note");
      }
      console.error("Create note error:", err);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !editingNote)
      return;

    try {
      const data = await apiCall(`/api/notes/${editingNote._id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      setNotes(
        notes.map((note) => (note._id === editingNote._id ? data.note : note))
      );
      setFormData({ title: "", content: "" });
      setEditingNote(null);
      setError("");
    } catch (err) {
      setError("Failed to update note");
      console.error("Update note error:", err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await apiCall(`/api/notes/${noteId}`, { method: "DELETE" });
      setNotes(notes.filter((note) => note._id !== noteId));
      setError("");
    } catch (err) {
      setError("Failed to delete note");
      console.error("Delete note error:", err);
    }
  };

  const handleUpgradeTenant = async () => {
    if (user.role !== "Admin") {
      setError("Only administrators can upgrade the plan");
      return;
    }

    try {
      await apiCall(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: "POST",
      });

      // Update user data in localStorage and context
      const updatedUser = {
        ...user,
        tenant: { ...user.tenant, plan: "PRO" },
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Refresh the page to update the user context
      window.location.reload();
    } catch (err) {
      setError("Failed to upgrade plan");
      console.error("Upgrade error:", err);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowCreateForm(false);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  const startCreating = () => {
    setShowCreateForm(true);
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Role Indicators */}
      <header className="bg-white shadow-sm border-b-4 border-indigo-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                📝 Notes Dashboard
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-medium">
                    {user?.tenant?.name || "Unknown"}
                  </span>
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.role === "Admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user?.role || "Unknown"}{" "}
                  {user?.role === "Admin" ? "👑" : "👤"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.tenant?.plan === "PRO"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user?.tenant?.plan || "FREE"} Plan{" "}
                  {user?.tenant?.plan === "PRO" ? "⭐" : "🆓"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Plan Status Card */}
        <div className="mb-8">
          <div
            className={`rounded-lg shadow p-6 border-l-4 ${
              user?.tenant?.plan === "PRO"
                ? "bg-green-50 border-green-400"
                : "bg-yellow-50 border-yellow-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  {user?.tenant?.plan === "PRO"
                    ? "⭐ Pro Plan"
                    : "🆓 Free Plan"}
                  {user?.tenant?.plan === "PRO" && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Unlimited
                    </span>
                  )}
                </h2>
                {user?.tenant?.plan === "FREE" && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      📊 <strong>{notes.length}/3</strong> notes used
                    </p>
                    {notes.length >= 2 && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ You&apos;re approaching your limit!
                      </p>
                    )}
                  </div>
                )}
                {user?.tenant?.plan === "PRO" && (
                  <p className="text-sm text-green-600 mt-1">
                    ✨ Enjoy unlimited notes and premium features!
                  </p>
                )}
              </div>
              {user?.tenant?.plan === "FREE" && user?.role === "Admin" && (
                <button
                  onClick={handleUpgradeTenant}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                >
                  🚀 Upgrade to Pro
                </button>
              )}
              {user?.tenant?.plan === "FREE" && user?.role !== "Admin" && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    💡 Only administrators can upgrade
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ask your admin to upgrade for unlimited notes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="text-red-400">⚠️</div>
              <div className="ml-3 text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Create/Edit form */}
        {(showCreateForm || editingNote) && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                {editingNote ? "✏️ Edit Note" : "➕ Create New Note"}
              </h3>
              <form
                onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
              >
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      📝 Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter note title"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700"
                    >
                      📄 Content
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter note content"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingNote ? "💾 Update Note" : "➕ Create Note"}
                  </button>
                  <button
                    type="button"
                    onClick={
                      editingNote
                        ? cancelEditing
                        : () => setShowCreateForm(false)
                    }
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes list header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            📚 Your Notes ({notes.length})
            {user?.tenant?.plan === "FREE" && (
              <span className="ml-2 text-sm text-gray-500">
                (Max: 3 on Free plan)
              </span>
            )}
          </h2>
          {!showCreateForm && !editingNote && (
            <button
              onClick={startCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
              disabled={user?.tenant?.plan === "FREE" && notes.length >= 3}
            >
              ➕ Create Note
            </button>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first note to get started!
            </p>
            <button
              onClick={startCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium"
            >
              ➕ Create First Note
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    📝 {note.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="text-xs text-gray-500 border-t pt-3">
                  <p>
                    📅 Created: {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  {note.createdBy?.email && (
                    <p>👤 By: {note.createdBy.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            🔍 Debug Information:
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>User Email:</strong> {user?.email || "Not loaded"}
            </p>
            <p>
              <strong>User Role:</strong> {user?.role || "Not loaded"}
            </p>
            <p>
              <strong>Tenant Name:</strong> {user?.tenant?.name || "Not loaded"}
            </p>
            <p>
              <strong>Tenant Plan:</strong> {user?.tenant?.plan || "Not loaded"}
            </p>
            <p>
              <strong>Notes Count:</strong> {notes.length}
            </p>
            <p>
              <strong>Token Available:</strong> {token ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;
