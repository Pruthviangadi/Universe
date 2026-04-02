'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [form, setForm] = useState({
    name: "",
    email: "",
    tag: "",
    imageUrl: "",
    id: userId,
  });
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const res = await axios.get(`/api/users/getAll`);
      const user = res.data.find((u: any) => u.id === userId);
      if (user) setForm(user);
      setFetched(true);
    }
    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios.put("/api/users/update", form);
    setLoading(false);
    router.push("/admin/users");
  };

  if (!fetched) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 relative">
        <button
          className="absolute left-6 top-6 text-gray-400 hover:text-gray-700 flex items-center gap-2"
          onClick={() => router.push("/admin/users")}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="text-3xl font-bold mb-8 text-center">Edit User</h1>
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
            disabled
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
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full font-semibold transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
} 