'use client';

import { Users } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import axios from "axios";
import { FaTimes, FaEdit, FaTrash, FaUser, FaEnvelope, FaTag, FaImage } from "react-icons/fa";

interface UserTableProps {
  users: Users[];
}

export default function UserTable({ users }: UserTableProps) {
  const [editUser, setEditUser] = useState<Users | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (user: Users) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (user: Users) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      await axios.delete(`/api/users/${user.email}`);
      window.location.reload();
    }
  };

  return (
    <div className="overflow-x-auto">
      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <EditUserModal user={editUser} onClose={() => setShowEditModal(false)} />
      )}
      <table className="min-w-full rounded-xl overflow-hidden shadow divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tag</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.id}
              className={
                idx % 2 === 0
                  ? "bg-white hover:bg-blue-50 transition"
                  : "bg-gray-50 hover:bg-blue-50 transition"
              }
            >
              <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                <img
                  className="h-10 w-10 rounded-full border"
                  src={user.imageUrl}
                  alt={user.name}
                />
                <span className="font-medium text-gray-900">{user.name}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">@{user.tag}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    user.isPrivate
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.isPrivate ? "Private" : "Public"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDelete(user)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditUserModal({ user, onClose }: { user: Users; onClose: () => void }) {
  const [form, setForm] = useState({ ...user });
  const [loading, setLoading] = useState(false);

  // Helper for floating label
  const floatLabel = (value: string) =>
    value ? "-top-3 text-xs text-blue-500" : "top-1/2 text-sm text-gray-400";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios.put("/api/users/update", form);
    setLoading(false);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn scale-95"
        style={{ animation: 'fadeInScale 0.25s cubic-bezier(.4,0,.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">Edit User</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Update the details for this user account.</p>
        <div className="space-y-5">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-transparent peer"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <label className={`absolute left-10 bg-white px-1 pointer-events-none transition-all duration-200 ${floatLabel(form.name)} -translate-y-1/2`}>Name</label>
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-transparent peer"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              disabled
            />
            <label className={`absolute left-10 bg-white px-1 pointer-events-none transition-all duration-200 ${floatLabel(form.email)} -translate-y-1/2`}>Email</label>
          </div>
          <div className="relative">
            <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-transparent peer"
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder="Tag"
            />
            <label className={`absolute left-10 bg-white px-1 pointer-events-none transition-all duration-200 ${floatLabel(form.tag)} -translate-y-1/2`}>Tag (optional)</label>
          </div>
          <div className="relative">
            <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-transparent peer"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
            />
            <label className={`absolute left-10 bg-white px-1 pointer-events-none transition-all duration-200 ${floatLabel(form.imageUrl)} -translate-y-1/2`}>Image URL</label>
          </div>
        </div>
        <div className="my-6 border-t" />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 w-full font-semibold transition text-lg shadow"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="mt-2 w-full border px-4 py-2 rounded hover:bg-gray-100 font-semibold"
          onClick={onClose}
        >
          Cancel
        </button>
      </form>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
} 