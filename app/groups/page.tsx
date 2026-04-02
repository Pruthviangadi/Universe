"use client";
import { useState, useEffect } from "react";
import { GroupList } from "@/components/groups/GroupList";
import { GroupChat } from "@/components/groups/GroupChat";
import { GroupInfo } from "@/components/groups/GroupInfo";
import { Group } from "@/types/group";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GroupsPage() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const searchParams = useSearchParams();
  const selectedGroupIdFromQuery = searchParams.get("selectedGroupId");
  const [groups, setGroups] = useState<Group[]>([]);
  const { data: session } = useSession();

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowInfo(false);
  };

  const handleUpdateGroup = () => {
    // Refresh group data
    if (selectedGroup) {
      fetch(`/api/groups/${selectedGroup.id}`)
        .then((res) => res.json())
        .then((data) => setSelectedGroup(data))
        .catch((error) => console.error("Error updating group:", error));
    }
  };

  // Fetch all groups for the user (reuse logic from GroupList or fetch here)
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch(() => setGroups([]));
  }, []);

  // Auto-select group if selectedGroupIdFromQuery is present
  useEffect(() => {
    if (selectedGroupIdFromQuery && groups.length > 0) {
      const found = groups.find((g) => g.id === selectedGroupIdFromQuery);
      if (found) setSelectedGroup(found);
    }
  }, [selectedGroupIdFromQuery, groups]);

  const isAdmin = selectedGroup?.members?.some(
    (member) => member.user.email === session?.user?.email && member.role === "admin"
  );

  return (
    <div className="flex w-full h-full gap-4 bg-background p-8 overflow-x-auto">
      {/* Group List Section */}
      <div className="w-[220px] max-w-[220px] flex-shrink-0 border-r bg-card p-6 rounded-lg">
        <GroupList
          onSelectGroup={handleSelectGroup}
          selectedGroupId={selectedGroup?.id}
          groups={groups}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-10 min-w-0 overflow-x-auto">
        {selectedGroup ? (
          <>
            {/* Chat Area */}
            <div className="bg-card p-6 rounded-lg relative flex-1 transition-all duration-300 min-w-[250px]">
              <GroupChat
                groupId={selectedGroup.id}
                groupName={selectedGroup.name}
                groupImage={selectedGroup.imageUrl}
                isAdmin={isAdmin}
                onShowInfo={() => setShowInfo(true)}
              />
              <button
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition"
                onClick={() => setShowInfo((v) => !v)}
                title="Show group info"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            {/* Group Info Modal */}
            <Dialog open={showInfo} onOpenChange={setShowInfo}>
              <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                  <DialogTitle>Group Info</DialogTitle>
                </DialogHeader>
                <GroupInfo
                  groupId={selectedGroup.id}
                  groupName={selectedGroup.name}
                  groupImage={selectedGroup.imageUrl}
                  members={selectedGroup.members}
                  onUpdateGroup={handleUpdateGroup}
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500">Select a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
} 