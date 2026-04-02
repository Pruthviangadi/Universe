"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal = ({ open, onClose }: HelpModalProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        toast.error("Failed to submit help message.");
      }
    } catch {
      toast.error("Failed to submit help message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-2 text-center">Need Help?</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300 text-center">Submit your issue or question and we'll get back to you shortly.</p>
        {submitted ? (
          <div className="text-center text-green-600 font-semibold py-8">
            Thank you! We'll get back to you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your Email"
              className="rounded-lg border-2 border-gray-300 p-3 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue or question..."
              className="rounded-lg border-2 border-gray-300 p-3 min-h-[100px] focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-500 p-3 text-white font-semibold hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default HelpModal; 