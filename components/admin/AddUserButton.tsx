'use client';

import { useState } from "react";
import axios from "axios";
import { FaTimes, FaUser, FaEnvelope, FaTag, FaImage, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AddUserButton() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    tag: "",
    imageUrl: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios.put("/api/users/signup", form);
    setLoading(false);
    setShowModal(false);
    window.location.reload();
  };

  // Helper for floating label
  const floatLabel = (value: string) =>
    value ? "-top-3 text-xs text-blue-500" : "top-1/2 text-sm text-gray-400";

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-md hover:from-blue-600 hover:to-blue-700 font-semibold shadow"
      >
        Add New User
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn scale-95"
            style={{ animation: 'fadeInScale 0.25s cubic-bezier(.4,0,.2,1)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-center">Add User</h2>
            <p className="text-gray-500 text-center mb-6 text-sm">Fill in the details to create a new user account.</p>
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
                  required
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
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full p-3 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-transparent peer pr-10"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <label className={`absolute left-10 bg-white px-1 pointer-events-none transition-all duration-200 ${floatLabel(form.password)} -translate-y-1/2`}>Password</label>
              </div>
            </div>
            <div className="my-6 border-t" />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 w-full font-semibold transition text-lg shadow"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </button>
            <button
              type="button"
              className="mt-2 w-full border px-4 py-2 rounded hover:bg-gray-100 font-semibold"
              onClick={() => setShowModal(false)}
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
      )}
    </>
  );
} 