import { Messages } from "@/app/(chats)/chats/[id]/page";
import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";
import Pusher from "pusher-js";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { LiaSpinnerSolid } from "react-icons/lia";
import toast from "react-hot-toast";
import axios from "axios";
import Message from "./message";
import { pusherClient } from "@/lib/pusher";

const DisplayMessages = ({
  messages,
  setMessages,
  chatRoomId,
  loadingMessage,
  setLoadingMessage,
}: {
  messages: Messages[];
  setMessages: Dispatch<SetStateAction<Messages[]>>;
  chatRoomId: string;
  loadingMessage: boolean;
  setLoadingMessage: Function;
}) => {
  const [parent, enableAnimations] = useAutoAnimate();
  const messageTopRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (!chatRoomId) return;
    
    const channel = pusherClient.subscribe(chatRoomId);
    
    channel.bind("Message", (data: string) => {
      const message = JSON.parse(data);
      setMessages((prev: Messages[]) => [...prev, message]);
    });

    return () => {
      pusherClient.unsubscribe(chatRoomId);
    };
  }, [chatRoomId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      messageTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages?.length]);

  const handleDelete = async (id: string) => {
    toast
      .promise(
        axios.put("/api/chats/messages/delete", {
          id,
          chatRoomId: chatRoomId,
        }),
        {
          loading: "deleting...",
          success: <p>Message deleted</p>,
          error: <p>Unable to delete message</p>,
        }
      )
      .then((response) => {
        if (response.data === "deleted") {
          setMessages((prev: Messages[]) =>
            prev.filter((post: any) => post?.id !== id)
          );
        }
      });
  };

  return (
    <div
      className=" flex h-[calc(100dvh_-_8rem)] w-full flex-col-reverse gap-4 overflow-y-scroll px-2 sm:h-[calc(100dvh_-_7.5rem)]"
      ref={parent}
    >
      {messages &&
        messages.map((message: Messages) => {
          return (
            <Message
              message={message}
              user={user}
              handleDelete={handleDelete}
              key={message.id}
            />
          );
        })}
    </div>
  );
};

export default DisplayMessages;
