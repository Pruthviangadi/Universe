"use client";

import { redirect } from "next/navigation";
import DisplayCommunityPosts, {
  CommunityPost,
} from "@/components/ui/communities/displayCommunityPosts";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import ProfileImage from "@/components/ui/profileImage";
import FeaturedAccount from "@/components/ui/featuredAccount";
import axios from "axios";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { useEffect, useState, useMemo, useRef } from "react";
import { Community } from "@prisma/client";
import { User } from "@/components/renderPages";
import CommunitySkeleton from "@/components/skeletons/communitySkeleton";
import CommunityEditModal from "@/components/ui/communities/CommunityEditModal";

interface community extends Community {
  members: User[];
  communityPosts: CommunityPost[];
  admin: User[];
  joinRequests?: {
    userId: string;
    status: string;
    user?: User;
  }[];
  isPrivate: boolean;
}

export default function Page({ params }: { params: { slug: string[] } }) {
  const [user, setUser] = useRecoilState(userState);
  const [Community, setCommunity] = useState<community>();
  const [showEditModal, setShowEditModal] = useState(false);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "member" | "admin">("none");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  useEffect(() => {
    const getCommunity = async () => {
      const { data } = await axios.get(`/api/communities/${params.slug[0]}`);
      setCommunity(data);
    };
    getCommunity();
  }, []);

  useEffect(() => {
    if (!Community || !user) return;
    if (Community.admin?.some((a) => a.id === user.id)) setJoinStatus("admin");
    else if (Community.members?.some((m) => m.id === user.id)) setJoinStatus("member");
    else if (Community.joinRequests?.some((r: any) => r.userId === user.id && r.status === "pending")) setJoinStatus("pending");
    else setJoinStatus("none");
  }, [Community, user]);

  const handleRequestJoin = async () => {
    if (!Community) return;
    try {
      await axios.post(`/api/communities/${Community.id}/join-request`, { userId: user.id });
      setJoinStatus("pending");
    } catch {
      alert("Failed to send join request");
    }
  };

  const handleApprove = async (userId: string) => {
    await axios.post(`/api/communities/${Community?.id}/approve-request`, { userId });
    setCommunity((prev) => ({
      ...prev!,
      joinRequests: prev?.joinRequests?.map((r: any) => r.userId === userId ? { ...r, status: "approved" } : r),
      members: ([...(prev?.members || []), prev?.joinRequests?.find((r: any) => r.userId === userId)?.user].filter(Boolean) as User[]),
    }));
  };

  const handleReject = async (userId: string) => {
    await axios.post(`/api/communities/${Community?.id}/reject-request`, { userId });
    setCommunity((prev) => ({
      ...prev!,
      joinRequests: prev?.joinRequests?.map((r: any) => r.userId === userId ? { ...r, status: "rejected" } : r),
    }));
  };

  const handleRemoveMember = async (userId: string) => {
    await axios.post(`/api/communities/${Community?.id}/remove-member`, { userId });
    setCommunity((prev) => ({
      ...prev!,
      members: prev?.members?.filter((m) => m.id !== userId) || [],
    }));
  };

  const handleCancelRequest = async () => {
    if (!Community) return;
    try {
      await axios.post(`/api/communities/${Community.id}/cancel-request`, { userId: user.id });
      setJoinStatus("none");
    } catch {
      alert("Failed to cancel join request");
    }
  };

  if (!user) {
    redirect("/");
  }

  if (!Community) {
    return <CommunitySkeleton />;
  }

  const isAdmin = Community?.admin?.some((a) => a.id === user?.id);

  const canViewContent = !Community?.isPrivate || isAdmin || joinStatus === "member";

  return (
    <div className="page flex w-full flex-col">
      <Link
        href="/communities"
        className=" sticky top-0 z-10 bg-lightTransparent p-1 shadow-md backdrop-blur-sm dark:bg-darkTransparent"
      >
        <p className=" flex items-center gap-4 p-2 text-xl font-extrabold ">
          <BiArrowBack /> {Community?.name}
        </p>
      </Link>

      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-6 w-full">
          <img
            src={Community?.imageUrl}
            alt={Community?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">{Community?.name}</h2>
            <p className="text-gray-500">{Community?.description}</p>
          </div>
        </div>
        {isAdmin && (
          <button
            className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setShowEditModal(true)}
          >
            Edit Community
          </button>
        )}
      </div>
      {canViewContent && (
        <>
          <div className=" mb-2 flex w-full justify-around gap-4 border-b-2 p-2">
            <Tabs communityId={Community?.id} tab={params.slug[1]} text="posts" />
            <Tabs communityId={Community?.id} tab={params.slug[1]} text="members" />
            <Tabs communityId={Community?.id} tab={params.slug[1]} text="admins" />
          </div>

          {(params.slug[1] === "posts" || !params.slug[1]) && (
            <DisplayCommunityPosts
              CommunityPosts={Community?.communityPosts as CommunityPost[]}
              id={params.slug[0]}
              admin={Community.admin}
            />
          )}

          {params.slug[1] === "members" && (
            <div>
              {isAdmin && (
                <button
                  className="mb-2 rounded bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  + Add Member
                </button>
              )}
              {Community?.members?.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between border-b py-2">
                  <FeaturedAccount user={member} />
                  {isAdmin && member.id !== user.id && (
                    <button
                      className="ml-4 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {showAddMemberModal && (
                <AddMemberModal
                  currentMembers={Community?.members || []}
                  onAdd={async (userId: string) => {
                    await axios.post(`/api/communities/${Community?.id}/add-member`, { userId });
                    setCommunity((prev) => ({
                      ...prev!,
                      members: ([...(prev?.members || []), user.followers?.find((u) => u.id === userId) || user.following?.find((u) => u.id === userId)].filter(Boolean) as User[]),
                    }));
                  }}
                  onClose={() => setShowAddMemberModal(false)}
                />
              )}
            </div>
          )}

          {params.slug[1] === "admins" && (
            <div>
              {Community?.admin?.map((user: any) => {
                return <FeaturedAccount user={user} />;
              })}
            </div>
          )}
        </>
      )}

      {showEditModal && (
        <CommunityEditModal
          community={{ ...Community, isOwnerOrAdmin: isAdmin }}
          onUpdated={(updated) => setCommunity((prev) => ({ ...prev, ...updated }))}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {(isAdmin || joinStatus === "member") && (
        <Link
          href={`/communityPost?community=${params.slug[0]}`}
          className=" sticky bottom-4 m-4 ml-auto w-fit rounded-full border-2 bg-darkTheme p-2 px-4 text-xl font-extrabold text-lightTheme dark:bg-lightTheme dark:text-darkTheme"
        >
          +
        </Link>
      )}

      {/* Join request logic for private communities */}
      {Community?.isPrivate && joinStatus === "none" && (
        <div className="flex justify-center my-4">
          <button
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={handleRequestJoin}
          >
            Request to Join
          </button>
        </div>
      )}
      {Community?.isPrivate && joinStatus === "pending" && (
        <div className="flex justify-center my-4">
          <button
            className="rounded bg-yellow-200 px-4 py-2 font-bold text-yellow-800 hover:bg-yellow-300"
            onClick={handleCancelRequest}
          >
            Request Sent (Click to Cancel)
          </button>
        </div>
      )}

      {/* Admin join request management - only show on Members tab */}
      {params.slug[1] === "members" && isAdmin && Community?.joinRequests && (
        <div className="my-4 mx-auto max-w-lg">
          <h3 className="mb-2 text-lg font-bold">Pending Join Requests</h3>
          {Community?.joinRequests?.filter((r: any) => r.status === "pending").length === 0 && (
            <p className="text-gray-500">No pending requests</p>
          )}
          {Community?.joinRequests?.filter((r: any) => r.status === "pending").map((r: any) => (
            <div key={r.userId} className="flex items-center justify-between rounded border p-2 mb-2">
              {r.user ? (
                <Link href={`/${r.user.tag}`} className="hover:underline font-medium flex items-center gap-2">
                  {r.user.name}
                  <span className="text-xs text-gray-500">@{r.user.tag}</span>
                </Link>
              ) : (
                <span>{r.userId}</span>
              )}
              <div className="flex gap-2">
                <button className="rounded bg-green-600 px-3 py-1 text-white" onClick={() => handleApprove(r.userId)}>Approve</button>
                <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => handleReject(r.userId)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Tabs = ({
  communityId,
  tab,
  text,
}: {
  communityId: string | undefined;
  tab: string | undefined;
  text: string;
}) => {
  return (
    <Link
      href={`/communities/${communityId}/${text}`}
      className={`${
        tab === text || (!tab && text === "posts")
          ? "border-b-4 border-b-blue-500"
          : ""
      } `}
      scroll={false}
    >
      <p className=" font-bold capitalize">{text}</p>
    </Link>
  );
};

function AddMemberModal({ currentMembers, onAdd, onClose }: { currentMembers: any[]; onAdd: (userId: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const memberIds = useMemo(() => currentMembers.map((m) => m.id), [currentMembers]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value) {
      setResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const users = await res.json();
          setResults(Array.isArray(users) ? users : []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const filteredResults = results.filter((u) => !memberIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div className="rounded bg-white p-6 shadow-lg min-w-[300px] max-w-[90vw]">
        <p className="mb-4 font-bold">Add Member</p>
        <input
          className="mb-2 w-full rounded border px-2 py-1"
          placeholder="Search users..."
          value={search}
          onChange={handleSearchChange}
        />
        <div className="max-h-60 overflow-y-auto">
          {loading && <p className="text-gray-500">Searching...</p>}
          {!loading && filteredResults.length === 0 && <p className="text-gray-500">No users found</p>}
          {filteredResults.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b py-2">
              <span>{u.name} <span className="text-xs text-gray-500">@{u.tag}</span></span>
              <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" onClick={() => onAdd(u.id)}>Add</button>
            </div>
          ))}
        </div>
        <button className="mt-4 rounded bg-gray-300 px-4 py-2" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
