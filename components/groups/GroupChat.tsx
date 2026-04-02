import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Loader2, Send, MoreVertical, LogOut } from "lucide-react";
import { GroupMessage } from "@/types/group";
import { UploadButton } from "@uploadthing/react";
import { AiOutlineVideoCamera } from "react-icons/ai";
import { RiAttachment2 } from "react-icons/ri";
import { BsImages, BsFileEarmarkText } from "react-icons/bs";
import toast from "react-hot-toast";
import ReactPlayer from "react-player";
import EmojiSelector from "@/components/ui/emojiSeletor";
import TextareaAutosize from "react-textarea-autosize";
import Image from "next/image";
import { OurFileRouter } from "@/app/api/uploadthing/core";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GroupChatProps {
  groupId: string;
  groupName: string;
  groupImage?: string;
  onShowInfo?: () => void;
  isAdmin?: boolean;
}

export function GroupChat({ groupId, groupName, groupImage, onShowInfo, isAdmin }: GroupChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageData, setMessageData] = useState({
    content: "",
    imageUrl: "",
    videoUrl: "",
    document: [] as { url: string; name: string }[],
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/groups/${groupId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    scrollToBottom();

    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageData.content && !messageData.imageUrl && !messageData.videoUrl && messageData.document.length === 0) return;
    if (!session?.user?.email) return;

    try {
      setSending(true);
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setMessageData({
        content: "",
        imageUrl: "",
        videoUrl: "",
        document: [],
      });
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setIsLeaving(true);
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to leave group');
      }

      toast.success('Successfully left the group');
      // Redirect or handle UI update after leaving
      window.location.href = '/groups'; // or use router.push('/groups') if using Next.js router
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {groupImage && (
            <Avatar className="h-10 w-10">
              <AvatarImage src={groupImage} />
              <AvatarFallback>{groupName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <h2 className="text-lg font-semibold">{groupName}</h2>
        </div>
        {!isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-100">
                <LogOut className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Group</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this group? You won't be able to see any messages or participate in the group chat anymore.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleLeaveGroup}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={isLeaving}
                >
                  {isLeaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Leave Group'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.user.email === session?.user?.email
                    ? "flex-row-reverse"
                    : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user.imageUrl} />
                  <AvatarFallback>
                    {message.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col ${
                    message.user.email === session?.user?.email
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.createdAt), "HH:mm")}
                    </span>
                    {(isAdmin || message.user.email === session?.user?.email) && (
                      <div className="relative ml-2">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          title="More options"
                          onClick={() => setOpenMenuId(openMenuId === message.id ? null : message.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === message.id && (
                          <div className="absolute right-0 z-10 mt-2 w-24 rounded bg-white shadow-lg border text-sm">
                            <button
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                              onClick={() => {
                                handleDeleteMessage(message.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-2 ${
                      message.user.email === session?.user?.email
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.imageUrl && (
                      <Image
                        src={message.imageUrl}
                        alt="Message attachment"
                        width={200}
                        height={200}
                        className="mt-2 max-w-sm rounded-lg"
                      />
                    )}
                    {message.videoUrl && (
                      <div className="mt-2">
                        <ReactPlayer
                          url={message.videoUrl}
                          controls={true}
                          width="auto"
                          height="auto"
                        />
                      </div>
                    )}
                    {message.document && message.document.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.document.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded bg-gray-200 p-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                          >
                            <BsFileEarmarkText />
                            <span>{doc.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="relative flex w-full flex-nowrap items-center gap-2">
          <div className="absolute -top-40">
            {messageData.imageUrl && (
              <Image
                src={messageData.imageUrl}
                width={50}
                height={50}
                alt="image"
                className="h-40 w-full rounded-xl object-contain"
              />
            )}

            {messageData.videoUrl && (
              <div className="flex h-10 w-fit justify-center">
                <ReactPlayer
                  url={messageData.videoUrl}
                  controls={true}
                  width="10"
                  height={200}
                />
              </div>
            )}

            {messageData.document.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {messageData.document.map((doc, index) => (
                  <div key={index} className="flex items-center gap-1 bg-slate-200 dark:bg-gray-800 p-2 rounded">
                    <BsFileEarmarkText />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(messageData.imageUrl || messageData.videoUrl || messageData.document.length > 0) && (
            <Button
              className="absolute -top-40 left-4 flex gap-1 rounded-full border-2"
              variant="secondary"
              size="sm"
              onClick={() => {
                setMessageData(prev => ({
                  ...prev,
                  imageUrl: "",
                  videoUrl: "",
                  document: []
                }));
              }}
            >
              Cancel
            </Button>
          )}

          <div className="relative flex w-full">
            <div className="absolute left-2 top-2">
              <EmojiSelector
                setPost={(value: any) => {
                  setMessageData(prev => ({
                    ...prev,
                    content: typeof value === 'function' 
                      ? value(prev).text 
                      : value.text
                  }));
                }}
              />
            </div>

            <TextareaAutosize
              placeholder="Type a message..."
              value={messageData.content}
              onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-3xl border-2 border-gray-500 bg-lightTheme p-2 pl-9 dark:bg-darkTheme"
              disabled={sending}
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
                  if (res && res[0]) {
                    setMessageData((prev) => ({
                      ...prev,
                      imageUrl: res[0].url,
                    }));
                    toast.success("Image uploaded!");
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Error uploading image: ${error.message}`);
                }}
                className="ut-button:w-fit ut-button:rounded-3xl ut-button:bg-lightTheme ut-button:p-4 ut-button:font-bold ut-button:text-darkTheme ut-allowed-content:hidden dark:ut-button:bg-slate-800 dark:ut-button:text-lightTheme"
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
                onClientUploadComplete={(res) => {
                  setMessageData((prev) => ({
                    ...prev,
                    videoUrl: res ? res[0]?.url : prev.videoUrl,
                  }));
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Failed to upload video`);
                }}
                className="ut-button:w-fit ut-button:rounded-3xl ut-button:bg-lightTheme ut-button:p-4 ut-button:font-bold ut-button:text-darkTheme ut-allowed-content:hidden dark:ut-button:bg-slate-800 dark:ut-button:text-lightTheme"
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
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setMessageData((prev) => ({
                      ...prev,
                      document: [...prev.document, { url: res[0].url, name: res[0].name }],
                    }));
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Failed to upload document`);
                }}
                className="ut-button:w-fit ut-button:rounded-3xl ut-button:bg-lightTheme ut-button:p-4 ut-button:font-bold ut-button:text-darkTheme ut-allowed-content:hidden dark:ut-button:bg-slate-800 dark:ut-button:text-lightTheme"
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" disabled={sending || (!messageData.content.trim() && !messageData.imageUrl && !messageData.videoUrl && messageData.document.length === 0)}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 