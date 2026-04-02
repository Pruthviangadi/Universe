"use client";

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineVideoCamera } from "react-icons/ai";
import { RiAttachment2 } from "react-icons/ri";
import TextareaAutosize from "react-textarea-autosize";
import { AiOutlineSend } from "react-icons/ai";
import { BsImages, BsFileEarmarkText } from "react-icons/bs";
import { Button } from "../button";
import axios from "axios";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import Image from "next/image";
import ReactPlayer from "react-player";
import EmojiSelector from "../emojiSeletor";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MakeMessage = ({
  chatRoomId,
  setLoadingMessage,
  setMessages,
  messages,
}: {
  chatRoomId: string;
  setLoadingMessage: Function;
  setMessages: Function;
  messages: any[];
}) => {
  const [post, setPost] = useState({
    text: "",
    image: "",
    video: "",
    document: [] as { url: string; name: string }[],
  });
  const [user, setUser] = useRecoilState(userState);

  const handleMessage = async () => {
    if (!post.text && !post.image && !post.video && post.document.length === 0) return;
    
    setLoadingMessage(true);
    const tempMessage = {
      id: Date.now().toString(),
      text: post.text,
      image: post.image,
      video: post.video,
      document: post.document,
      createdAt: new Date(),
      user: {
        id: user.id,
        name: user.name,
        imageUrl: user.imageUrl,
        tag: user.tag,
      }
    };

    setPost({
      text: "",
      image: "",
      video: "",
      document: [],
    });

    setMessages([tempMessage, ...(messages || [])]);

    try {
      const response = await axios.post("/api/chats/messages/new", {
        ...post,
        email: user.email,
        id: chatRoomId,
      });
      
      if (response.status !== 200) {
        toast.error("Failed to send message");
        setLoadingMessage(false);
      }
    } catch (error) {
      toast.error("Failed to send message");
      setLoadingMessage(false);
    }
  };

  return (
    <div className="relative flex w-full flex-nowrap items-center gap-2 p-2">
      <div className="absolute -top-40">
        {post.image && (
          <Image
            src={post.image}
            width={50}
            height={50}
            alt="image"
            className="h-40 w-full rounded-xl object-contain"
          />
        )}

        {post.video && (
          <div className="flex h-10 w-fit justify-center">
            <ReactPlayer
              url={post.video}
              controls={true}
              width="10"
              height={200}
            />
          </div>
        )}

        {post.document.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.document.map((doc, index) => (
              <div key={index} className="flex items-center gap-1 bg-slate-200 dark:bg-gray-800 p-2 rounded">
                <BsFileEarmarkText />
                <span className="text-sm">{doc.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(post.image || post.video || post.document.length > 0) && (
        <Button
          className="absolute -top-40 left-4 flex gap-1 rounded-full border-2"
          variant="secondary"
          size="sm"
          onClick={() => {
            setPost((prev) => ({ ...prev, image: "", video: "", document: [] }));
          }}
        >
          Cancel
        </Button>
      )}

      <div className="relative flex w-full">
        <div className="absolute left-2 top-2">
          <EmojiSelector setPost={setPost} />
        </div>

        <TextareaAutosize
          placeholder="Write a message"
          value={post.text}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, text: e.target.value }))
          }
          className="w-full rounded-3xl border-2 border-gray-500 bg-lightTheme p-2 pl-9 dark:bg-darkTheme"
        />
      </div>

      <Popover>
        <PopoverTrigger className="text-2xl">
          <RiAttachment2 />
        </PopoverTrigger>
        <PopoverContent className="grid w-fit gap-4 rounded-xl bg-slate-300 dark:bg-gray-700">
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            content={{
              button({ ready }: { ready: boolean }) {
                if (ready)
                  return (
                    <div className="flex items-center gap-2">
                      <BsImages />
                      Image
                    </div>
                  );
                return "loading...";
              },
            }}
            onClientUploadComplete={(res: { url: string }[]) => {
              if (res) {
                setPost((prev) => ({
                  ...prev,
                  image: res[0].url,
                }));
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            className="ut-button:bg-slate-400 ut-button:dark:bg-gray-600 ut-button:dark:hover:bg-gray-500 ut-button:hover:bg-slate-500 ut-button:dark:text-white ut-button:text-black ut-button:dark:border-gray-500 ut-button:border-slate-500 ut-button:dark:focus-within:ring-gray-500 ut-button:focus-within:ring-slate-500"
          />

          <UploadButton<OurFileRouter, "videoUploader">
            endpoint="videoUploader"
            content={{
              button({ ready }: { ready: boolean }) {
                if (ready)
                  return (
                    <div className="flex items-center gap-2">
                      <AiOutlineVideoCamera />
                      Video
                    </div>
                  );
                return "loading...";
              },
            }}
            onClientUploadComplete={(res: { url: string }[]) => {
              if (res) {
                setPost((prev) => ({
                  ...prev,
                  video: res[0].url,
                }));
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            className="ut-button:bg-slate-400 ut-button:dark:bg-gray-600 ut-button:dark:hover:bg-gray-500 ut-button:hover:bg-slate-500 ut-button:dark:text-white ut-button:text-black ut-button:dark:border-gray-500 ut-button:border-slate-500 ut-button:dark:focus-within:ring-gray-500 ut-button:focus-within:ring-slate-500"
          />

          <UploadButton<OurFileRouter, "chatDocumentUploader">
            endpoint="chatDocumentUploader"
            content={{
              button({ ready }: { ready: boolean }) {
                if (ready)
                  return (
                    <div className="flex items-center gap-2">
                      <BsFileEarmarkText />
                      Document
                    </div>
                  );
                return "loading...";
              },
            }}
            onClientUploadComplete={(res: { url: string; name: string }[]) => {
              if (res) {
                setPost((prev) => ({
                  ...prev,
                  document: [...prev.document, ...res],
                }));
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            className="ut-button:bg-slate-400 ut-button:dark:bg-gray-600 ut-button:dark:hover:bg-gray-500 ut-button:hover:bg-slate-500 ut-button:dark:text-white ut-button:text-black ut-button:dark:border-gray-500 ut-button:border-slate-500 ut-button:dark:focus-within:ring-gray-500 ut-button:focus-within:ring-slate-500"
          />
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        className="rounded-3xl font-bold"
        onClick={handleMessage}
        disabled={!post.text && !post.image && !post.video && post.document.length === 0}
      >
        <AiOutlineSend />
      </Button>
    </div>
  );
};

export default MakeMessage;
