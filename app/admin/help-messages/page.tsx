"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { LiaSpinnerSolid } from "react-icons/lia";
import { toast } from "react-hot-toast";

interface HelpMessage {
  id: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  internalNote?: string;
}

const statusOptions = ["New", "In Progress", "Resolved"];

const HelpMessagesPage = () => {
  const [messages, setMessages] = useState<HelpMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [noteModal, setNoteModal] = useState<{ open: boolean; message?: HelpMessage }>({ open: false });
  const [note, setNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/help-messages");
      setMessages(res.data);
    } catch {
      toast.error("Failed to fetch help messages");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axios.put(`/api/admin/help-messages/${id}`, { status });
      setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, status } : msg)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openNoteModal = (message: HelpMessage) => {
    setNote(message.internalNote || "");
    setNoteModal({ open: true, message });
  };

  const handleNoteSave = async () => {
    if (!noteModal.message) return;
    setNoteSaving(true);
    try {
      await axios.put(`/api/admin/help-messages/${noteModal.message.id}`, { internalNote: note });
      setMessages((prev) => prev.map((msg) => (msg.id === noteModal.message!.id ? { ...msg, internalNote: note } : msg)));
      setNoteModal({ open: false });
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setNoteSaving(false);
    }
  };

  const filteredMessages = filter === "All" ? messages : messages.filter((m) => m.status === filter);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-3xl font-bold">Help Messages</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <label className="mr-2 font-medium">Filter by status:</label>
          <select
            className="rounded border px-3 py-2 dark:bg-gray-800 dark:text-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white font-semibold hover:bg-blue-600"
          onClick={fetchMessages}
        >
          Refresh
        </button>
      </div>
      <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LiaSpinnerSolid className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Message</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No help messages found.</td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-blue-700 dark:text-blue-300">
                      <a href={`mailto:${msg.email}`} className="hover:underline">
                        {msg.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={msg.message}>{msg.message}</td>
                    <td className="px-6 py-4">
                      <select
                        className="rounded border px-2 py-1 dark:bg-gray-700 dark:text-white"
                        value={msg.status}
                        onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-blue-500 hover:underline font-semibold"
                        onClick={() => openNoteModal(msg)}
                      >
                        {msg.internalNote ? "View/Edit Note" : "Add Note"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Note Modal */}
      {noteModal.open && noteModal.message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setNoteModal({ open: false })}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2">Internal Note</h2>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 p-3 min-h-[100px] focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Add internal note..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="rounded bg-gray-300 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-400"
                onClick={() => setNoteModal({ open: false })}
                disabled={noteSaving}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white font-semibold hover:bg-blue-600"
                onClick={handleNoteSave}
                disabled={noteSaving}
              >
                {noteSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpMessagesPage; 