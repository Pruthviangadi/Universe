'use client';

import { Community, Users } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { UploadButton } from "@/utils/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface CommunityTableProps {
  communities: (Community & {
    members: {
      id: string;
      name: string;
      email: string;
    }[];
    admin: {
      id: string;
      name: string;
      email: string;
    }[];
  })[];
}

export default function CommunityTable({ communities }: CommunityTableProps) {
  const [editCommunity, setEditCommunity] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteCommunity, setDeleteCommunity] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleEdit = (community: any) => {
    setEditCommunity(community);
    setShowEditModal(true);
  };

  const handleDelete = (community: any) => {
    setDeleteCommunity(community);
    setShowDeleteModal(true);
  };

  return (
    <div className="overflow-x-auto">
      {/* Add Community Modal */}
      {showAddModal && (
        <AddCommunityModal onClose={() => setShowAddModal(false)} />
      )}
      {/* Edit Community Modal */}
      {showEditModal && editCommunity && (
        <EditCommunityModal community={editCommunity} onClose={() => setShowEditModal(false)} />
      )}
      {/* Delete Community Modal */}
      {showDeleteModal && deleteCommunity && (
        <DeleteCommunityModal community={deleteCommunity} onClose={() => setShowDeleteModal(false)} />
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Communities</h2>
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 font-semibold shadow"
          onClick={() => setShowAddModal(true)}
        >
          + Add Community
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Community
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Members
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creator
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {communities.map((community) => (
            <tr key={community.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={community.imageUrl}
                      alt={community.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {community.name}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  <p className="truncate max-w-md">{community.description}</p>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {community.members.length} members
                </div>
                <div className="text-sm text-gray-500">
                  {community.admin.length} admins
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    community.isPrivate
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {community.isPrivate ? "Private" : "Public"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {community.admin && community.admin.length > 0 ? community.admin[0].name : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(community.updatedAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  onClick={() => handleEdit(community)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDelete(community)}
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

function EditCommunityModal({ community, onClose }: { community: any; onClose: () => void }) {
  const [form, setForm] = useState({ ...community });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await axios.patch(`/api/communities/${community.id}`, form);
    setLoading(false);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
        <h2 className="text-2xl font-bold mb-2 text-center">Edit Community</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Update the details for this community.</p>
        <div className="space-y-5">
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
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <input
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Image URL"
          />
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

function DeleteCommunityModal({ community, onClose }: { community: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await axios.delete(`/api/communities/${community.id}/delete`);
    setLoading(false);
    onClose();
    window.location.reload();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white border border-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn scale-95">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Delete Community</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Are you sure you want to delete <span className="font-bold">{community.name}</span>? This action cannot be undone.</p>
        <button
          onClick={handleDelete}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded hover:from-red-600 hover:to-red-700 w-full font-semibold transition text-lg shadow"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          className="mt-2 w-full border px-4 py-2 rounded hover:bg-gray-100 font-semibold"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function AddCommunityModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // User search by email
  useEffect(() => {
    if (!userQuery) {
      setUserResults([]);
      return;
    }
    setUserSearchLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(userQuery)}`);
        if (res.ok) {
          const users = await res.json();
          setUserResults(users);
        } else {
          setUserResults([]);
        }
      } catch {
        setUserResults([]);
      } finally {
        setUserSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [userQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please select an admin for the community.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/communities/create', { ...form, userId: selectedUser.id });
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
        <h2 className="text-2xl font-bold mb-2 text-center">Add Community</h2>
        <p className="text-gray-500 text-center mb-6 text-sm">Create a new community for your users.</p>
        <div className="space-y-5">
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
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
          <div>
            <label className="block mb-1 font-semibold">Community Image</label>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Community" className="mb-2 w-20 h-20 object-cover rounded-full" />
            )}
            <UploadButton<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]?.url) {
                  setForm((prev) => ({ ...prev, imageUrl: res[0].url }));
                }
              }}
              onUploadError={(error: Error) => {
                console.error("Error uploading image:", error);
              }}
              className="ut-button:bg-blue-500 ut-button:ut-readying:bg-blue-500/50"
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">Private Community</span>
          </label>
          <div>
            <label className="block mb-1 font-semibold">Admin (search by email)</label>
            <input
              type="text"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Type email to search..."
              value={userQuery}
              onChange={e => {
                setUserQuery(e.target.value);
                setSelectedUser(null);
              }}
            />
            {userSearchLoading && <div className="text-xs text-gray-400 mt-1">Searching...</div>}
            {userResults.length > 0 && !selectedUser && (
              <div className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto">
                {userResults.map(user => (
                  <div
                    key={user.id}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer flex items-center gap-2"
                    onClick={() => setSelectedUser(user)}
                  >
                    <img src={user.imageUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                    <span>{user.name} ({user.email})</span>
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 flex items-center gap-2 p-2 border rounded bg-blue-50">
                <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-6 h-6 rounded-full" />
                <span>{selectedUser.name} ({selectedUser.email})</span>
                <button type="button" className="ml-auto text-xs text-red-500" onClick={() => setSelectedUser(null)}>Change</button>
              </div>
            )}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="my-6 border-t" />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded hover:from-blue-600 hover:to-blue-700 w-full font-semibold transition text-lg shadow"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Community"}
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
 