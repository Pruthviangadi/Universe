'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

export default function AddUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    tag: "",
    imageUrl: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios.post("/api/users/signup", form);
    setLoading(false);
    router.push("/admin/users");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 relative">
        <button
          className="absolute left-6 top-6 text-gray-400 hover:text-gray-700 flex items-center gap-2"
          onClick={() => router.push("/admin/users")}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="text-3xl font-bold mb-8 text-center">Add New User</h1>
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="tag"
            value={form.tag}
            onChange={handleChange}
            placeholder="Tag"
            required
          />
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Image URL"
          />
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full font-semibold transition"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
} 