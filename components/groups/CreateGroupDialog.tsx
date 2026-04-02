import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  tag: string;
}

export function CreateGroupDialog() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setFetchingUsers(true);
      fetch("/api/users/getAll")
        .then((res) => res.json())
        .then((data) => {
          // Exclude current user
          setUsers(
            data.filter((u: User) => u.email !== session?.user?.email)
          );
        })
        .catch(() => setUsers([]))
        .finally(() => setFetchingUsers(false));
    }
  }, [open, session?.user?.email]);

  const handleToggleUser = (user: User) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u.email === user.email)) {
        return prev.filter((u) => u.email !== user.email);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!session?.user?.email) return;

    try {
      setLoading(true);

      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName,
          imageUrl: groupImageUrl,
          memberEmails: selectedUsers.map((u) => u.email),
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to create group";
        try {
          const errorData = await response.json();
          if (errorData?.error) errorMsg = errorData.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const newGroup = await response.json();
      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setOpen(false);
      setGroupName("");
      setGroupImageUrl("");
      setSelectedUsers([]);

      // Redirect to the new group's chat page
      if (newGroup?.id) {
        router.push(`/groups?selectedGroupId=${newGroup.id}`);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new group chat and add members by selecting from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <Label>Search Users</Label>
          <Input
            type="text"
            placeholder="Search users by username or name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-2"
          />
          <Label>Members</Label>
          {fetchingUsers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading users...
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded border p-2">
              {users.length === 0 ? (
                <div className="text-sm text-muted-foreground">No users found.</div>
              ) : (
                users
                  .filter((user) =>
                    user.tag.toLowerCase().includes(search.toLowerCase()) ||
                    user.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((user) => {
                    const selected = selectedUsers.some((u) => u.email === user.email);
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-accent ${selected ? "bg-accent" : ""}`}
                        onClick={() => handleToggleUser(user)}
                      >
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">@{user.tag}</span>
                        </div>
                        {selected && <span className="ml-auto text-xs text-primary">Selected</span>}
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label>Group Image (Optional)</Label>
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            appearance={{
              button: "bg-gray-200 px-3 py-1 rounded text-sm font-medium hover:bg-gray-300 transition",
              allowedContent: "hidden"
            }}
            content={{
              button(_) {
                return <span>Upload Image</span>;
              }
            }}
            onClientUploadComplete={(res) => {
              const imageUrl = res && (res[0]?.ufsUrl || res[0]?.url);
              if (imageUrl) {
                setGroupImageUrl(imageUrl);
                toast({ title: "Image uploaded!" });
              }
            }}
            onUploadError={() => {}}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateGroup}
            disabled={loading || !groupName || selectedUsers.length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 