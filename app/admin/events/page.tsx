"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start: "",
    end: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.start || !form.end) {
      setFormError("Title, Start, and End are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to add event.");
      return;
    }
    setShowModal(false);
    setForm({ title: "", description: "", location: "", start: "", end: "" });
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };

  const openEditModal = (event: Event) => {
    setForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      start: event.start.slice(0, 16),
      end: event.end.slice(0, 16),
    });
    setEditId(event.id);
    setShowModal(true);
  };

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.title || !form.start || !form.end) {
      setFormError("Title, Start, and End are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/events/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to update event.");
      return;
    }
    setShowModal(false);
    setEditId(null);
    setForm({ title: "", description: "", location: "", start: "", end: "" });
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };

  const handleDeleteEvent = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    const res = await fetch(`/api/events/${deleteId}`, { method: "DELETE" });
    setSubmitting(false);
    setDeleteId(null);
    setLoading(true);
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Add Event
        </button>
      </div>
      {loading ? (
        <div>Loading events...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-card rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Start</th>
                <th className="py-2 px-4 text-left">End</th>
                <th className="py-2 px-4 text-left">Location</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b">
                  <td className="py-2 px-4 font-medium">{event.title}</td>
                  <td className="py-2 px-4">{new Date(event.start).toLocaleString()}</td>
                  <td className="py-2 px-4">{new Date(event.end).toLocaleString()}</td>
                  <td className="py-2 px-4">{event.location || "-"}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500" onClick={() => openEditModal(event)}>Edit</button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={() => setDeleteId(event.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={editId ? handleEditEvent : handleAddEvent} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Title<span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleInput} className="w-full border rounded px-3 py-2" rows={2} />
              </div>
              <div>
                <label className="block font-medium mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleInput} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block font-medium mb-1">Start<span className="text-red-500">*</span></label>
                <input type="datetime-local" name="start" value={form.start} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium mb-1">End<span className="text-red-500">*</span></label>
                <input type="datetime-local" name="end" value={form.end} onChange={handleInput} className="w-full border rounded px-3 py-2" required />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => { setShowModal(false); setEditId(null); }} disabled={submitting}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={submitting}>{submitting ? (editId ? "Saving..." : "Adding...") : (editId ? "Save Changes" : "Add Event")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Delete Event</h2>
            <p>Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setDeleteId(null)} disabled={submitting}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleDeleteEvent} disabled={submitting}>{submitting ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 