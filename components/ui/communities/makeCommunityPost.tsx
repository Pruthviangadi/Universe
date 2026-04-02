"use client";

import { useRef, useState } from "react";
import { Button } from "../button";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import type { UploadThingError } from "@uploadthing/shared";
import type { Json } from "@uploadthing/shared";
import toast from "react-hot-toast";
import { AiOutlineVideoCamera } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import { useRouter } from "next/navigation";

import Image from "next/image";
import ReactPlayer from "react-player";
import Mention from "../mention";
import EmojiSelector from "../emojiSeletor";
import { useRecoilState } from "recoil";
import { communityPostState } from "@/state/atoms/CommunityPostState";
import { userState } from "@/state/atoms/userState";
import axios from "axios";

export default function MakeCommunityPost({ id }: { id: string }) {
  const [totalCommunityPosts, setTotalCommunityPosts] =
    useRecoilState(communityPostState);
  const [user, setUser] = useRecoilState(userState);
  const [post, setPost] = useState({
    text: "",
    image: "",
    video: "",
  });
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const resp = await axios.post("/api/communityPosts/create", {
            ...post,
            userEmail: user.email,
            id: id,
          });
          if (resp.status === 200 && resp.data) {
            setTotalCommunityPosts((prev) => [resp.data, ...prev]);
            toast.success("Posted");
          } else {
            toast.error("Could not Post.");
          }
        } catch {
          toast.error("Could not Post.");
        }
        setPost({
          text: "",
          image: "",
          video: "",
        });
      }}
      ref={formRef}
      className=" w-full rounded-3xl bg-slate-200 p-2 dark:bg-gray-800 sm:p-8 "
    >
      {post.image && (
        <Image
          src={post.image}
          width={50}
          height={50}
          alt="image"
          className=" h-40 w-full rounded-xl object-contain"
        />
      )}

      {post.video && (
        <div className=" flex justify-center">
          <ReactPlayer
            url={post.video}
            controls={true}
            width="auto"
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
            }}
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-4 py-8 pb-2 ">
        <textarea
          name="text"
          id=""
          cols={30}
          rows={1}
          value={post.text}
          onChange={(e) => {
            if (e.target.value.slice(-1) === "@") {
              setIsOpen(true);
            }
            setPost((prev) => ({ ...prev, text: e.target.value }));
          }}
          placeholder="Write a post"
          className=" w-full rounded-3xl border-2 border-gray-500 bg-lightTheme p-2 dark:bg-darkTheme"
        ></textarea>

        <EmojiSelector setPost={setPost} />

        <Button
          type="submit"
          className=" rounded-3xl font-bold"
          disabled={post.text || post.image || post.video ? false : true}
        >
          Post
        </Button>
      </div>
      <Mention
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setPost={setPost}
        text={post.text}
      />
      <div className=" flex gap-4 p-4">
        {!post.video && (
          <UploadButton<OurFileRouter, "imageUploader">
            endpoint="imageUploader"
            content={{
              button({ ready }: { ready: boolean }) {
                if (ready)
                  return (
                    <div className=" flex items-center gap-2">
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
            onUploadError={(error: UploadThingError<Json>) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            className="ut-button:bg-slate-400 ut-button:dark:bg-gray-600 ut-button:dark:hover:bg-gray-500 ut-button:hover:bg-slate-500 ut-button:dark:text-white ut-button:text-black ut-button:dark:border-gray-500 ut-button:border-slate-500 ut-button:dark:focus-within:ring-gray-500 ut-button:focus-within:ring-slate-500"
          />
        )}

        {!post.image && (
          <UploadButton<OurFileRouter, "videoUploader">
            endpoint="videoUploader"
            content={{
              button({ ready }: { ready: boolean }) {
                if (ready)
                  return (
                    <div className=" flex items-center gap-2">
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
            onUploadError={(error: UploadThingError<Json>) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            className="ut-button:bg-slate-400 ut-button:dark:bg-gray-600 ut-button:dark:hover:bg-gray-500 ut-button:hover:bg-slate-500 ut-button:dark:text-white ut-button:text-black ut-button:dark:border-gray-500 ut-button:border-slate-500 ut-button:dark:focus-within:ring-gray-500 ut-button:focus-within:ring-slate-500"
          />
        )}
      </div>
    </form>
  );
}
