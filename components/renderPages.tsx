"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/sidebar";
import FeaturedTab from "@/components/ui/featuredTab";
import MobileNavbar from "./ui/mobileNavbar";
import axios from "axios";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import { useRouter } from "next/navigation";

const RenderPages = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useRecoilState(userState);
  const router = useRouter();

  const pathname = usePathname();

  const headerLessRoutes = ["/", "/signin", "/signup", "/setup-profile"];
  const protectedRoutes = [
    "/home",
    "/editProfile",
    "/post",
    "/setup-profile",
    "/communities",
    "/chats",
  ];

  const footerLessRouteRegex = /\/(communities|chats)\/([\w-]+)$/;
  const isFooterLessRoute = pathname.match(footerLessRouteRegex);

  const isHeaderLessPathName = headerLessRoutes.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");

  if (protectedRoutes.includes(pathname) && status === "unauthenticated")
    router.push("/signin");

  useEffect(() => {
    const fetchUser = async () => {
      const user = await axios.get(`/api/users/${session?.user?.email}`);
      setUser(user?.data);
    };
    if (session?.user) {
      fetchUser();
    }
  }, [session?.user]);

  if (isHeaderLessPathName) {
    return <div>{children}</div>;
  }
  if (!isHeaderLessPathName) {
    const isGroupsPage = pathname === "/groups";
    if (isGroupsPage) {
      return (
        <div className="flex w-screen h-screen">
          <Sidebar compact />
          {children}
        </div>
      );
    }
    if (isAdminRoute) {
      return (
        <div className="flex w-full items-center justify-center">
          <main className="dvh w-screen overflow-x-hidden overflow-y-scroll sm:w-full sm:pb-0">
            {children}
          </main>
        </div>
      );
    }
    return (
      <div className=" flex w-full items-center justify-center  ">
        <div className=" grid w-full grid-cols-1 sm:grid-cols-12 2xl:w-fit ">
          <Sidebar />
          <main
            className={`${
              !isFooterLessRoute ? " pb-20" : ""
            }  dvh w-screen overflow-x-hidden overflow-y-scroll  sm:col-start-3 sm:col-end-13 sm:w-full sm:pb-0 lg:col-end-9`}
          >
            {children}
            {!isFooterLessRoute && <MobileNavbar />}
          </main>
          {!isGroupsPage && <FeaturedTab />}
        </div>
      </div>
    );
  }
  return null;
};
export default RenderPages;

export interface User {
  createdAt: Date;
  email: string;
  id: string;
  imageUrl: string;
  name: string;
  password: string | null;
  updatedAt: Date;
  tag: string;
  bgImage: string | null;
  about: string;
  posts?: any[];
  followers?: User[];
  following?: User[];
  savedPosts?: any[];
  likedPosts?: any[];
  chatRooms?: any[];
  isVerified: boolean;
  isPrivate: boolean;
  followRequests?: any[];
  sentRequests?: any[];
}
