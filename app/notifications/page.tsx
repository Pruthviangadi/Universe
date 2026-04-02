"use client";

import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { pusherClient } from "@/lib/pusher";
import { FaHeart, FaComment, FaUserPlus, FaEnvelope } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  message: string;
  link?: string;
  createdAt: Date;
  type: string;
  read: boolean;
}

const iconMap: Record<string, JSX.Element> = {
  like: <FaHeart className="text-pink-500" />,
  comment: <FaComment className="text-blue-500" />,
  follow: <FaUserPlus className="text-green-500" />,
  message: <FaEnvelope className="text-yellow-500" />,
};

const Page = () => {
  const [user] = useRecoilState(userState);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user.id) return;
    
    // Initial fetch of notifications
    axios.get(`/api/notifications?userId=${user.id}`).then(res => setNotifications(res.data));

    // Subscribe to real-time notifications
    const channel = pusherClient.subscribe(`user-${user.id}-notifications`);
    
    channel.bind("new-notification", (data: string) => {
      const newNotification = JSON.parse(data);
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      pusherClient.unsubscribe(`user-${user.id}-notifications`);
    };
  }, [user.id]);

  return (
    <div className="page flex flex-col items-center justify-start p-8 min-h-screen">
      <h2 className="mb-6 text-2xl font-bold">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">No Notifications</div>
      ) : (
        <div className="w-full max-w-xl space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-center gap-3 rounded-lg border p-3 mb-2 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-sm ${!n.read ? "bg-blue-50 dark:bg-blue-900 border-blue-300" : "bg-white dark:bg-slate-800 border-slate-200"}`}
              onClick={() => n.link && router.push(n.link)}
            >
              <div className="text-2xl">{iconMap[n.type] || <FaEnvelope />}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{n.message}</p>
                <span className="text-xs text-gray-500 block mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
              </div>
              {!n.read && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Unread" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
