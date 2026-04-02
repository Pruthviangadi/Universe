import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/components/renderPages";
import ProfileImage from "./profileImage";
import { Button } from "./button";
import toast from "react-hot-toast";

interface FollowRequest {
  id: string;
  fromUser: User;
  toUser: User;
  status: string;
  createdAt: Date;
}

const FollowRequests = ({ userId }: { userId: string }) => {
  const [requests, setRequests] = useState<FollowRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`/api/follow-request?userId=${userId}`);
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching follow requests:", error);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleRequest = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      await axios.put("/api/follow-request", { requestId, status });
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      toast.success(`Follow request ${status}`);
    } catch (error) {
      console.error("Error handling follow request:", error);
      toast.error("Failed to handle follow request");
    }
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 z-50 max-h-[80vh] w-80 overflow-y-auto rounded-lg bg-white p-4 shadow-lg dark:bg-slate-800">
      <h3 className="mb-4 text-lg font-semibold">Follow Requests</h3>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border p-2 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <ProfileImage src={request.fromUser.imageUrl} size={40} />
              <div>
                <p className="font-medium">{request.fromUser.name}</p>
                <p className="text-sm text-gray-500">@{request.fromUser.tag}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleRequest(request.id, "accepted")}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Accept
              </Button>
              <Button
                onClick={() => handleRequest(request.id, "rejected")}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowRequests; 