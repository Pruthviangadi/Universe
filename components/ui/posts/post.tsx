"use client";

import ProfileImage from "../profileImage";
import { AiOutlineHeart } from "react-icons/ai";
import { FcLike } from "react-icons/fc";
import { BsBookmark, BsFillBookmarkFill, BsThreeDots } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { MdDeleteOutline, MdVerified } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import axios from "axios";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { InView } from "react-intersection-observer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "react-hot-toast";

const Post = ({
  post,
  isAuthor,
  handleDelete,
}: {
  post: any;
  isAuthor: boolean;
  handleDelete?: Function;
}) => {
  const date = new Date(post?.createdAt);
  const timeAgo = formatDistanceToNowStrict(date, { addSuffix: true });
  const [user, setUser] = useRecoilState(userState);
  const [likes, setLikes] = useState([...Object.values(post.likedBy)]);
  const isLiked = likes.some((users: any) => users?.id === user?.id);
  const [saves, setSaves] = useState([...Object.values(post.savedby)]);
  const isSaved = saves.some((users: any) => users?.id === user?.id);
  let text = highlightMentions(post.text);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {});

  const handleLike = (postId: string) => {
    if (!isLiked) {
      axios.put("/api/post/like", { postId, userId: user?.id });
      setLikes((prev) => [user, ...prev]);
    }
    if (isLiked) {
      axios.put("/api/post/dislike", { postId, userId: user?.id });
      const newLikes = likes.filter((like: any) => like?.id !== user?.id);
      setLikes(newLikes);
    }
  };
  const handleSave = (postId: string) => {
    if (!isSaved) {
      axios.put("/api/post/save", { postId, userId: user?.id });
      setSaves((prev) => [user, ...prev]);
    }
    if (isSaved) {
      axios.put("/api/post/unsave", { postId, userId: user?.id });
      const newSaves = saves.filter((like: any) => like?.id !== user?.id);
      setSaves(newSaves);
    }
  };

  const handleReport = async () => {
    try {
      const response = await axios.post("/api/post/report", {
        postId: post.id,
        reason: reportReason,
        description: reportDescription,
      });

      if (response.status === 201) {
        toast.success("Post reported successfully");
        setShowReportDialog(false);
        setReportReason("");
        setReportDescription("");
      }
    } catch (error) {
      toast.error("Failed to report post");
    }
  };

  return (
    <div className=" relative flex w-full  flex-col gap-2" key={post?.id}>
      <div className="flex w-full gap-2 rounded-lg  p-4">
        <Link href={`/${post?.user?.tag}`} className=" h-fit">
          <ProfileImage src={post?.user?.imageUrl} size={50} />
        </Link>

        <div className=" flex w-full flex-col  gap-2 pr-4">
          <Link
            href={`/${post?.user?.tag}`}
            className=" flex items-center gap-2"
          >
            <p className=" font-bold">{post?.user?.name}</p>
            {post?.user?.isVerified && (
              <div className=" text-lg font-extrabold text-yellow-400">
                <MdVerified />
              </div>
            )}
          </Link>

          <p className=" -mt-2 text-xs text-darkGray dark:text-lightGray">
            {post?.user?.about?.slice(0, 30)}
            {post?.user?.about?.length > 30 ? "..." : ""}
          </p>

          <Link href={`/post/${post?.id}`}>
            <p className=" max-w-xl text-darkTheme dark:text-lightTheme">
              {text}
            </p>
          </Link>

          {post.image && (
            <Link href={`/preview?src=${post.image}`}>
              <Image
                src={post.image}
                width={200}
                height={200}
                alt=""
                className="w-full max-w-lg self-start rounded-xl border-2 object-contain"
              />
            </Link>
          )}

          {post.video && (
            <InView>
              {({ inView, ref, entry }) => (
                <div className=" flex justify-center rounded-xl" ref={ref}>
                  <ReactPlayer
                    url={post.video}
                    playing={inView}
                    controls={true}
                    width="auto"
                    height="auto"
                  />
                </div>
              )}
            </InView>
          )}
        </div>
      </div>

      <div className="  flex justify-around gap-4 pb-2 text-darkGray dark:text-lightGray">
        <div
          onClick={() => handleLike(post?.id)}
          className=" flex items-center gap-2"
        >
          {isLiked ? <FcLike /> : <AiOutlineHeart />}
          <p>{likes.length}</p>
        </div>
        <Link
          href={`/post/${post?.id}?tab=comments`}
          className=" flex items-center gap-2"
        >
          <FaRegComment />
          <p>{post?.comments?.length}</p>
        </Link>
        <div
          onClick={() => handleSave(post?.id)}
          className=" flex items-center gap-2"
        >
          {isSaved ? <BsFillBookmarkFill /> : <BsBookmark />}
          <p>{saves.length}</p>
        </div>
        {!isAuthor && (
          <div
            onClick={() => setShowReportDialog(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <BsThreeDots />
          </div>
        )}
      </div>
      <p className=" border-b-2 px-4 pb-2 text-xs text-darkGray dark:text-lightGray">
        {timeAgo}
      </p>
      {isAuthor && (
        <AlertDialog>
          <AlertDialogTrigger
            className={`absolute right-8 top-4 flex items-center rounded-lg border-2 border-slate-500 bg-lightTheme p-2 text-xs dark:bg-darkTheme`}
          >
            <MdDeleteOutline /> <p className=" hidden sm:inline">Delete</p>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (handleDelete) {
                    handleDelete(post?.id, post?.user?.email);
                  }
                }}
              >
                Delete Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Post</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">Select a reason</option>
                    <option value="violence">Violence</option>
                    <option value="harassment">Harassment</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                    rows={4}
                    placeholder="Please provide more details about your report..."
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={!reportReason || !reportDescription}
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default Post;

// Function to process and highlight mentions in text
export function highlightMentions(text: string) {
  const regex = /@(\w+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // Odd-indexed parts are mentions, wrap them in a span
      return (
        <Link href={`/${part}`} key={index} className="text-blue-500">
          @{part}
        </Link>
      );
    } else {
      // Even-indexed parts are regular text, display them as is
      return part;
    }
  });
}
