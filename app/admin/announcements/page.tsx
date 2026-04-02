"use client";
import { useEffect, useState } from "react";
import { UploadButton, UploadDropzone, Uploader } from "@uploadthing/react";
import ReactMarkdown from "react-markdown";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { toast } from "react-hot-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  attachments: { url: string; name: string }[];
  createdAt: string;
}

const categories = ["General", "Circular", "Event", "Resource"];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: categories[0],
    attachments: [] as { url: string; name: string }[],
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveFile = (url: string) => {
    setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((a) => a.url !== url) }));
  };

  const openEditModal = (a: Announcement) => {
    setForm({
      title: a.title,
      content: a.content,
      category: a.category,
      attachments: a.attachments,
    });
    setEditId(a.id);
    setShowModal(true);
  };

  const handleEditAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.content || !form.category) {
      setFormError("Title, Content, and Category are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/announcements/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to update announcement.");
      return;
    }
    setShowModal(false);
    setEditId(null);
    setForm({ title: "", content: "", category: categories[0], attachments: [] });
    setLoading(true);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const res = await fetch(`/api/announcements/${deleteId}`, { method: "DELETE" });
    setSubmitting(false);
    setDeleteId(null);
    setLoading(true);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.content || !form.category) {
      setFormError("Title, Content, and Category are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to add announcement.");
      return;
    }
    setShowModal(false);
    setForm({ title: "", content: "", category: categories[0], attachments: [] });
    setLoading(true);
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Announcements</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Add Announcement
        </button>
      </div>
      {loading ? (
        <div>Loading announcements...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Attachments</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2 px-4 font-medium">{a.title}</td>
                  <td className="py-2 px-4">{a.category}</td>
                  <td className="py-2 px-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    {a.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {a.attachments.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{file.name}</a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500" onClick={() => openEditModal(a)}>Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => setDeleteId(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Announcement" : "Add Announcement"}</h2>
            <form onSubmit={editId ? handleEditAnnouncement : handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title<span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium mb-1">Content<span className="text-red-500">*</span></label>
                <textarea name="content" value={form.content} onChange={handleInput} className="w-full border rounded px-3 py-2" rows={4} required />
                <div className="mt-2 text-xs text-muted-foreground">Supports Markdown formatting.</div>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Category<span className="text-red-500">*</span></label>
                <select name="category" value={form.category} onChange={handleInput} className="w-full border rounded px-3 py-2">
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Attachments</label>
                <UploadButton<OurFileRouter, "documentUploader">
                  endpoint="documentUploader"
                  onClientUploadComplete={(res) => {
                    setForm((prev) => ({
                      ...prev,
                      attachments: res.map((file) => ({
                        url: file.url,
                        name: file.name,
                      })),
                    }));
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              </div>
              {form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.attachments.map((file, i) => (
                    <div key={i} className="relative group">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block underline text-blue-600">
                        {file.name}
                      </a>
                      <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100" onClick={() => handleRemoveFile(file.url)}>&times;</button>
                    </div>
                  ))}
                </div>
              )}
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => { setShowModal(false); setEditId(null); }} disabled={submitting}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={submitting}>{submitting ? (editId ? "Saving..." : "Adding...") : (editId ? "Save Changes" : "Add Announcement")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Delete Announcement</h2>
            <p>Are you sure you want to delete this announcement?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setDeleteId(null)} disabled={submitting}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDeleteAnnouncement} disabled={submitting}>{submitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 