"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  attachments: { url: string; name: string }[];
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Announcements</h1>
      {loading ? (
        <div>Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-muted-foreground text-center">No announcements yet.</div>
      ) : (
        <div className="space-y-8">
          {announcements.map((a) => (
            <div key={a.id} className="bg-card rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{a.title}</span>
                  <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">{a.category}</span>
                </div>
                <span className="text-sm text-muted-foreground mt-2 md:mt-0">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="prose dark:prose-invert max-w-none mb-4">
                <ReactMarkdown>{a.content}</ReactMarkdown>
              </div>
              {a.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {a.attachments.map((file, i) => {
                    const isImage = /\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(file.name);
                    return isImage ? (
                      <img
                        key={i}
                        src={file.url}
                        alt={file.name}
                        className="max-h-64 rounded shadow border cursor-pointer"
                        style={{ maxWidth: "100%", objectFit: "contain" }}
                        onClick={() => setModalImage(file.url)}
                      />
                    ) : (
                      <a
                        key={i}
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 text-sm font-medium transition"
                      >
                        <span>📎</span> {file.name}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {modalImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={() => setModalImage(null)}
            >
              <img
                src={modalImage}
                alt="Full"
                className="max-h-[90vh] max-w-[90vw] rounded shadow-lg"
                onClick={e => e.stopPropagation()}
              />
              <button
                className="absolute top-4 right-4 text-white text-3xl font-bold"
                onClick={() => setModalImage(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 