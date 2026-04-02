import { Messages } from "@/app/(chats)/chats/[id]/page";
import { User } from "@/components/renderPages";
import { formatDistanceToNowStrict, differenceInSeconds, differenceInMinutes } from "date-fns";
import React, { useState, useEffect } from "react";
import ProfileImage from "../profileImage";
import Image from "next/image";
import Link from "next/link";
import { InView } from "react-intersection-observer";
import ReactPlayer from "react-player";
import { MdDeleteOutline } from "react-icons/md";
import { BsThreeDotsVertical, BsFileEarmarkText } from "react-icons/bs";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Message = ({
  message,
  user,
  handleDelete,
}: {
  message: Messages;
  user: User;
  handleDelete: (id: string) => void;
}) => {
  const [timeAgo, setTimeAgo] = useState("");
  const date = new Date(message.createdAt);

  useEffect(() => {
    const updateTime = () => {
      const secondsAgo = differenceInSeconds(new Date(), date);
      const minutesAgo = differenceInMinutes(new Date(), date);

      if (secondsAgo < 60) {
        setTimeAgo(secondsAgo <= 10 ? 'just now' : `${secondsAgo} seconds ago`);
      } else {
        setTimeAgo(formatDistanceToNowStrict(date, { addSuffix: true }));
      }
    };
    
    updateTime(); // Initial update
    
    // Use different update frequencies based on message age
    const secondsAgo = differenceInSeconds(new Date(), date);
    let interval: NodeJS.Timeout;
    
    if (secondsAgo < 60) {
      // Update every second for the first minute
      interval = setInterval(updateTime, 1000);
    } else {
      // Update every minute after the first minute
      interval = setInterval(updateTime, 60000);
    }
    
    return () => clearInterval(interval);
  }, [date]);

  const isAuthor = message.user.id === user.id;

  return (
    <div
      className={`flex gap-2 ${
        isAuthor ? " flex-row-reverse self-end" : ""
      } relative`}
    >
      <ProfileImage src={message.user.imageUrl} size={40} />
      <div
        className={` ${
          isAuthor ? " rounded-tr-none pr-6" : "rounded-tl-none"
        } w-fit rounded-xl  bg-slate-200 p-2 dark:bg-gray-800`}
      >
        <p className="max-w-xs sm:max-w-sm">{message.text}</p>

        {message?.image && (
          <Link href={`/preview?src=${message?.image}`}>
            <Image
              src={message?.image}
              width={200}
              height={200}
              alt=""
              className="w-full max-w-lg self-start rounded-xl border-2 object-contain"
            />
          </Link>
        )}

        {message?.video && (
          <InView>
            {({ inView, ref, entry }) => (
              <div className="flex justify-center rounded-xl" ref={ref}>
                <ReactPlayer
                  url={message?.video as string}
                  playing={inView}
                  controls={true}
                  width="auto"
                  height="auto"
                />
              </div>
            )}
          </InView>
        )}

        {message?.document && message.document.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.document.map((doc: { url: string; name: string }, index: number) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded bg-slate-300 p-2 text-sm hover:bg-slate-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <BsFileEarmarkText />
                <span>{doc.name}</span>
              </a>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs text-darkGray dark:text-lightGray">
          {timeAgo}
        </p>

        {isAuthor && (
          <Popover>
            <PopoverTrigger className="absolute right-11 top-2">
              <BsThreeDotsVertical />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-2 dark:bg-gray-500">
              <button
                onClick={() => handleDelete(message.id)}
                className={`flex items-center`}
              >
                <MdDeleteOutline />
                <p>Delete</p>
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default Message;
