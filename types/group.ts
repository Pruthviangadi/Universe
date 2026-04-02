export interface GroupUser {
  id: string;
  name: string;
  imageUrl: string;
  email: string;
}

export interface GroupMember {
  user: GroupUser;
  role: "admin" | "member";
}

export interface Group {
  id: string;
  name: string;
  imageUrl?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMessage {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  document?: { url: string; name: string }[];
  createdAt: string;
  user: GroupUser;
  groupId: string;
} 