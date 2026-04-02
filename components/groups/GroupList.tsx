import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Group } from "@/types/group";

interface GroupListProps {
  onSelectGroup: (group: Group) => void;
  selectedGroupId?: string;
  groups?: Group[];
}

export function GroupList({ onSelectGroup, selectedGroupId, groups: externalGroups }: GroupListProps) {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>(externalGroups || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (externalGroups) {
      setGroups(externalGroups);
      setLoading(false);
      return;
    }
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/groups");
        if (!response.ok) throw new Error("Failed to fetch groups");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [externalGroups]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <CreateGroupDialog />
      </div>
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {groups.map((group) => (
              <Button
                key={group.id}
                variant={selectedGroupId === group.id ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => onSelectGroup(group)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={group.imageUrl} />
                  <AvatarFallback>
                    {group.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{group.name}</span>
                  <span className="text-xs text-gray-500">
                    {group.members.length} members
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 