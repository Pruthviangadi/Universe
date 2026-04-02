"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./button";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { User } from "@/components/renderPages";
import axios from "axios";
import { FeaturedAccountType } from "./featuredAccount";
import toast from "react-hot-toast";

interface FollowRequest {
  id: string;
  status: string;
}

type UserType = User | FeaturedAccountType;

const Follow = ({ user: targetUser }: { user: UserType }) => {
  const [user, setUser] = useRecoilState(userState);
  const [requestStatus, setRequestStatus] = useState<"pending" | "none" | "accepted">("none");
  const [requestId, setRequestId] = useState<string>("");

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const response = await axios.get(`/api/follow-request/status?fromUserId=${user.id}&toUserId=${targetUser.id}`);
        if (response.data) {
          setRequestStatus(response.data.status);
          setRequestId(response.data.id);
        }
      } catch (error) {
        console.error("Error checking request status:", error);
      }
    };

    if ('isPrivate' in targetUser && targetUser.isPrivate && !isFollowing) {
      checkRequestStatus();
    }
  }, [user.id, targetUser.id]);

  const isFollowing = user.following?.some((u: User) => u.id === targetUser.id) || requestStatus === "accepted";

  const getButtonText = () => {
    if (isFollowing) {
      return "Following";
    } else if ('isPrivate' in targetUser && targetUser.isPrivate && requestStatus === "pending") {
      return "Requested";
    } else {
      return "Follow";
    }
  };

  const handleFollow = async () => {
    try {
      if ('isPrivate' in targetUser && targetUser.isPrivate) {
        if (requestStatus === "pending") {
          // Withdraw the request
          await axios.delete(`/api/follow-request/${requestId}`);
          setRequestStatus("none");
          setRequestId("");
          toast.success("Follow request withdrawn");
        } else if (requestStatus === "accepted") {
          // Already following, do nothing
          toast.success("Already following");
        } else {
          // Send follow request for private accounts
          const response = await axios.post("/api/follow-request", {
            fromUserId: user.id,
            toUserId: targetUser.id,
          });
          setRequestStatus("pending");
          setRequestId(response.data.id);
          toast.success("Follow request sent (private account)");
        }
      } else {
        // Direct follow for public accounts
        await axios.put("/api/follow", {
          followedById: user.id,
          followedToId: targetUser.id,
        });
        setUser((prev) => ({
          ...prev,
          following: [...(prev.following || []), targetUser as User],
        }));
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.delete("/api/follow", {
        data: {
          fromUserId: user.id,
          toUserId: targetUser.id,
        },
      });
      // Remove accepted follow request if exists
      if (requestStatus === "accepted" && requestId) {
        await axios.delete(`/api/follow-request/${requestId}`);
      }
      setUser((prev) => ({
        ...prev,
        following: prev.following?.filter((u: User) => u.id !== targetUser.id),
      }));
      setRequestStatus("none"); // Reset request status after unfollow
      setRequestId("");
      toast.success("Unfollowed successfully");
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    }
  };

  const getButtonClassName = () => {
    if (isFollowing) {
      return "follow-button following";
    }
    if (requestStatus === "pending") {
      return "follow-button requested";
    }
    return "follow-button";
  };

  return (
    <>
      <style jsx>{`
        .follow-button {
          @apply rounded-lg border-2 p-2 transition-all duration-200 ease-in-out;
          @apply border-blue-500 text-blue-500;
        }
        .follow-button:hover {
          @apply bg-blue-500 text-white;
        }
        .follow-button.following {
          @apply border-gray-500 text-gray-500;
        }
        .follow-button.following:hover {
          @apply border-red-500 text-red-500 bg-transparent;
        }
        .follow-button.following:hover:before {
          content: "Unfollow";
        }
        .follow-button.requested {
          @apply border-gray-500 text-gray-500;
        }
        .follow-button.requested:hover {
          @apply border-red-500 text-red-500 bg-transparent;
        }
        .follow-button.requested:hover:before {
          content: "Cancel Request";
        }
      `}</style>
      <Button
        onClick={isFollowing ? handleUnfollow : handleFollow}
        className={getButtonClassName()}
      >
        <span className="button-text">{getButtonText()}</span>
      </Button>
    </>
  );
};

export default Follow;
