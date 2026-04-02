"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailAlerts: true,
    sessionTimeout: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTheme, resolvedTheme } = useTheme();

  // Sync theme with backend setting on load
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          darkMode: data.darkMode,
          emailAlerts: data.emailAlerts,
          sessionTimeout: data.sessionTimeout,
        });
        // Set theme on load
        setTheme(data.darkMode ? "dark" : "light");
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // If darkMode toggle, update theme immediately
    if (name === "darkMode") {
      setTheme(checked ? "dark" : "light");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          darkMode: settings.darkMode,
          emailAlerts: settings.emailAlerts,
          sessionTimeout: Number(settings.sessionTimeout),
        }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Admin Settings</h1>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-lg">Dark Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>
        {/* Email Alerts Toggle */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-lg">Email Alerts</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-all peer-checked:translate-x-5"></div>
          </label>
        </div>
        {/* Session Timeout */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-lg">Session Timeout (minutes)</span>
          <input
            type="number"
            name="sessionTimeout"
            min={5}
            max={240}
            value={settings.sessionTimeout}
            onChange={handleChange}
            className="w-20 px-2 py-1 border rounded text-right"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {success && <span className="ml-4 text-green-600 font-medium">Settings saved!</span>}
          {error && <span className="ml-4 text-red-600 font-medium">{error}</span>}
        </div>
      </form>
    </div>
  );
} 