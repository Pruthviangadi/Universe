import axios from "axios";
import { useQuery } from "react-query";
import FeaturedAccount from "./featuredAccount";
import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { userState } from "@/state/atoms/userState";
import toast from "react-hot-toast";
import Follow from "./follow";

const FeaturedTab = () => {
  const router = useRouter();
  const currentUser = useRecoilValue(userState);
  const { isLoading, error, data } = useQuery("all users", () =>
    axios.get("/api/users/getAll")
  );

  const handleMessage = async (person: any) => {
    if (currentUser.id === person.id) {
      toast.error("You cannot create a chat room with yourself");
      return;
    }

    try {
      const response = await axios.post("/api/chats/create", {
        personId: person.id,
        userId: currentUser.id,
      });

      if (response.status === 200) {
        router.push(response.data);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Could not create chat room");
    }
  };

  return (
    <aside className="hidden h-screen w-full flex-col overflow-y-scroll border-l-2 p-2 lg:col-start-9 lg:col-end-13 lg:flex">
      <div className="rounded-2xl bg-slate-200 p-2 dark:bg-slate-800">
        <h1 className="p-2 text-xl font-extrabold">Who to follow</h1>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">Error loading users</div>
        ) : (
          data?.data
            .filter((user: any) => user.email !== currentUser.email)
            .map((user: any) => (
              <div key={user.id} className="flex w-full items-center justify-between p-2">
                <FeaturedAccount user={user} />
                <div className="flex items-center gap-2">
                  <Follow user={user} />
                  <Button
                    onClick={() => handleMessage(user)}
                    className="rounded-lg border-2 border-blue-500 p-2 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Message
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>
    </aside>
  );
};

export default FeaturedTab;
