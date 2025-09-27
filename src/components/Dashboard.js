"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import DebugInfo from "./DebugInfo";

const Dashboard = () => {
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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/notes");
      setNotes(data.notes);
      setError("");
    } catch (err) {
      setError("Failed to fetch notes");
      console.error("Fetch notes error:", err);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Notes Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                {user.tenant.name} • {user.role} • {user.tenant.plan} Plan
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Info - Remove this in production */}
        <DebugInfo />

        {/* Plan status and actions */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Current Plan: {user.tenant.plan}
                </h2>
                {user.tenant.plan === "FREE" && (
                  <p className="text-sm text-gray-600 mt-1">
                    {notes.length}/3 notes used
                  </p>
                )}
                {user.tenant.plan === "PRO" && (
                  <p className="text-sm text-gray-600 mt-1">Unlimited notes</p>
                )}
              </div>
              {user.tenant.plan === "FREE" && user.role === "Admin" && (
                <button
                  onClick={handleUpgradeTenant}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Create/Edit form */}
        {(showCreateForm || editingNote) && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingNote ? "Edit Note" : "Create New Note"}
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
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter note title"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Content
                    </label>
                    <textarea
                      id="content"
                      rows={4}
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter note content"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingNote ? "Update Note" : "Create Note"}
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
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Your Notes ({notes.length})
          </h2>
          {!showCreateForm && !editingNote && (
            <button
              onClick={startCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Note
            </button>
          )}
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              No notes yet. Create your first note!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => startEditing(note)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="text-xs text-gray-500">
                  <p>
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                  {note.createdBy?.email && <p>By: {note.createdBy.email}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
