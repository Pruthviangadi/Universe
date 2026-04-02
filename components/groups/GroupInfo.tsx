import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, UserPlus, UserMinus, Crown, Search, Pencil } from "lucide-react";
import { Group, GroupMember } from "@/types/group";
import { UploadButton } from "@/utils/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useRouter } from "next/navigation";

interface GroupInfoProps {
  groupId: string;
  groupName: string;
  groupImage?: string;
  members: GroupMember[];
  onUpdateGroup: () => void;
}

export function GroupInfo({
  groupId,
  groupName,
  groupImage,
  members,
  onUpdateGroup,
}: GroupInfoProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(groupName);
  const [editImageUrl, setEditImageUrl] = useState(groupImage);
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const router = useRouter();
  const isOwner = members.some(
    (member) => member.user.email === session?.user?.email && member.role === "admin"
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current user is admin
  const currentUserMember = members.find(
    (member) => member.user.email === session?.user?.email
  );
  const isCurrentUserAdmin = currentUserMember?.role === "admin";

  const handleAddMember = async (user: any) => {
    if (!user?.email) return;
    try {
      setLoading(true);
      console.log('Adding member:', user.email);
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberEmails: [user.email],
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData?.error || "Failed to add member",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Success",
        description: "Member added successfully",
      });
      setSearchTerm("");
      setSearchResults([]);
      setShowDropdown(false);
      onUpdateGroup();
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(!!value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const users = await res.json();
          setSearchResults(Array.isArray(users) ? users : []);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleRemoveMember = async (memberEmail: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberEmail,
        }),
      });

      if (!response.ok) throw new Error("Failed to remove member");

      toast({
        title: "Success",
        description: "Member removed successfully",
      });

      onUpdateGroup();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberEmail: string, newRole: "admin" | "member") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberEmail,
          role: newRole,
        }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      onUpdateGroup();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, imageUrl: editImageUrl }),
      });
      if (!res.ok) throw new Error("Failed to update group");
      toast({ title: "Success", description: "Group updated" });
      setEditing(false);
      onUpdateGroup();
    } catch (e) {
      toast({ title: "Error", description: "Failed to update group", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete group");
      toast({ title: "Group deleted" });
      setShowDeleteConfirm(false);
      router.push("/groups");
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete group", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <button onClick={() => setShowImageModal(true)} className="focus:outline-none">
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarImage src={editImageUrl || groupImage} />
                <AvatarFallback>{groupName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </button>
            {isCurrentUserAdmin && editing && (
              <UploadButton<OurFileRouter, "imageUploader">
                endpoint="imageUploader"
                appearance={{
                  button: "bg-gray-200 px-3 py-1 rounded text-sm font-medium hover:bg-gray-300 transition",
                  allowedContent: "hidden",
                }}
                onClientUploadComplete={(res) => {
                  if (res && res[0]?.url) {
                    setEditImageUrl(res[0].url);
                    toast({ title: "Image uploaded!" });
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Error uploading image:", error);
                }}
              />
            )}
            {/* Modal for viewing large group image */}
            {showImageModal && (
              <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent className="flex flex-col items-center">
                  <img
                    src={editImageUrl || groupImage}
                    alt="Group"
                    className="max-h-[60vh] max-w-full rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="flex flex-col">
            {editing ? (
              <input
                className="text-lg font-semibold border rounded px-2 py-1 mb-1"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={editLoading}
              />
            ) : (
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {groupName}
                {isCurrentUserAdmin && (
                  <button className="ml-1" onClick={() => setEditing(true)} title="Edit group name">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </h2>
            )}
            <p className="text-sm text-gray-500">{members.length} members</p>
            {editing && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditGroup} disabled={editLoading || !editName.trim()}>
                    {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={editLoading}>Cancel</Button>
                </div>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete Group
                  </Button>
                )}
                {/* Delete confirmation dialog */}
                {showDeleteConfirm && (
                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Group</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">Are you sure you want to delete this group? This action cannot be undone.</div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteGroup}>Delete</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isCurrentUserAdmin && (
            <div className="space-y-2 relative">
              <Label>Add New Member</Label>
              <div className="flex gap-2">
                <div className="relative w-full flex-1">
                  <Input
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search username..."
                    disabled={loading}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
                <Button disabled>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchTerm && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-darkTheme border rounded shadow max-h-48 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-2 text-center text-gray-500 text-sm">Searching...</div>
                  ) : (!Array.isArray(searchResults) || searchResults.length === 0) ? (
                    <div className="p-2 text-center text-gray-500 text-sm">No users found</div>
                  ) : (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => !loading && handleAddMember(user)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label>Members</Label>
            {members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.imageUrl} />
                    <AvatarFallback>
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.user.name}</span>
                      {member.role === "admin" && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {member.user.email}
                    </span>
                  </div>
                </div>
                {isCurrentUserAdmin && member.user.email !== session?.user?.email && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleUpdateRole(
                          member.user.email,
                          member.role === "admin" ? "member" : "admin"
                        )
                      }
                      disabled={loading}
                    >
                      {member.role === "admin" ? "Remove Admin" : "Make Admin"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user.email)}
                      disabled={loading}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 