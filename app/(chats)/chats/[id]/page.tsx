"use client";
import { User } from "@/components/renderPages";
import DisplayMessages from "@/components/ui/chats/displayMessages";
import MakeMessage from "@/components/ui/chats/makeMessage";
import ProfileImage from "@/components/ui/profileImage";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { LiaSpinnerSolid } from "react-icons/lia";
import toast from "react-hot-toast";

export interface Messages {
  id: string;
  text: string | null;
  image: string | null;
  video: string | null;
  document: { url: string; name: string }[] | null;
  createdAt: Date;
  chatRoomId?: string;
  user: User;
}

const Page = ({ params }: { params: { id: string } }) => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const [chatInfo, setChatInfo] = useState<User | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getMessages = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/chats/messages/${params.id}`);
        
        if (!data.members || data.members.length === 0) {
          throw new Error("Chat not found or you don't have access");
        }

        setMessages(data.messages || []);
        setChatInfo(data.members[0] || null);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        setError(error.response?.data || "Failed to load chat");
        toast.error(error.response?.data || "Failed to load chat");
        router.push("/chats");
      } finally {
        setIsLoading(false);
      }
    };
    getMessages();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="dvh flex w-full items-center justify-center">
        <div className="animate-spin text-5xl">
          <LiaSpinnerSolid />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dvh flex w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/chats" className="text-blue-500 hover:underline">
          Return to Chats
        </Link>
      </div>
    );
  }

  return (
    <div className="dvh w-full overflow-hidden">
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-slate-100 p-2 font-extrabold shadow-md backdrop-blur-sm dark:bg-gray-900">
        <Link href="/chats">
          <BiArrowBack />
        </Link>

        {chatInfo && (
          <Link href={`/${chatInfo.tag}`}>
            <div className="flex gap-2">
              <ProfileImage src={chatInfo.imageUrl} size={50} />
              <div>
                <p>{chatInfo.name}</p>
                <p className="text-xs font-light text-darkGray dark:text-lightGray">
                  @{chatInfo.tag}
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      <DisplayMessages
        messages={messages}
        setMessages={setMessages}
        chatRoomId={params.id}
        setLoadingMessage={setLoadingMessage}
        loadingMessage={loadingMessage}
      />
      <MakeMessage
        chatRoomId={params.id}
        setLoadingMessage={setLoadingMessage}
        setMessages={setMessages}
        messages={messages}
      />
    </div>
  );
};

export default Page;
