import React, { useState } from "react";
import Modal from "@/components/modal";
import { inputClassnames } from "@/components/inputClassNames";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import type { UploadThingError } from "@uploadthing/shared";
import type { Json } from "@uploadthing/shared";
import toast from "react-hot-toast";
import ProfileImage from "@/components/ui/profileImage";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { X } from "lucide-react";

export default function CommunityEditModal({
  community,
  onUpdated,
  onClose,
}: {
  community: any;
  onUpdated?: (updated: any) => void;
  onClose?: () => void;
}) {
  const [name, setName] = useState(community.name || "");
  const [description, setDescription] = useState(community.description || "");
  const [imageUrl, setImageUrl] = useState(community.imageUrl || "/team-placeholder.png");
  const [isPrivate, setIsPrivate] = useState(!!community.isPrivate);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await axios.patch(`/api/communities/${community.id}`, {
        name,
        description,
        imageUrl,
        isPrivate,
      });
      toast.success("Community updated");
      if (onUpdated) onUpdated(resp.data);
      if (onClose) onClose();
    } catch (err) {
      toast.error("Failed to update community");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/communities/${community.id}/delete`);
      toast.success("Community deleted");
      window.location.href = "/communities";
    } catch {
      toast.error("Failed to delete community");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal>
      <div className="relative flex items-center justify-center min-h-[400px] animate-fadeIn">
        <form
          onSubmit={handleEdit}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 flex flex-col gap-6 relative"
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-center text-2xl font-bold mb-2">Edit Community</h2>
          <div className="flex flex-col items-center gap-3">
            <ProfileImage src={imageUrl} size={100} />
            <UploadButton<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res: { url: string }[]) => {
                toast.success("successfully uploaded photo");
                setImageUrl(res ? res[0]?.url : imageUrl);
              }}
              onUploadError={(error: UploadThingError<Json>) => {
                toast.error(`ERROR! ${error.message}`);
              }}
              className="dark:ut-allowed-content:text-lightTheme"
            />
          </div>
          <div className="grid gap-2">
            <label className="font-medium">Name</label>
            <input
              type="text"
              className={inputClassnames}
              placeholder="Community name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="font-medium">Description</label>
            <textarea
              cols={20}
              rows={3}
              className={inputClassnames}
              placeholder="About your community"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <label htmlFor="privacy-toggle" className="font-medium">Private Community</label>
            <button
              type="button"
              id="privacy-toggle"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPrivate ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setIsPrivate((v) => !v)}
              aria-pressed={isPrivate}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-1'}`}
              />
            </button>
            <span className="text-xs text-gray-500 min-w-[180px]">
              {isPrivate ? "Only approved members can view posts and details" : "Anyone can view posts and details"}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={onClose} type="button" className="flex-1">
                Cancel
              </Button>
            </div>
            {/* Show delete button only for owner/admin */}
            {community.isOwnerOrAdmin && (
              <Button
                type="button"
                className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Community"}
              </Button>
            )}
          </div>
        </form>
      </div>
      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Modal>
  );
} 