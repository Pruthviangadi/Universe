"use client";

import ProfileImage from "@/components/ui/profileImage";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { SlCalender } from "react-icons/sl";
import { MdVerified } from "react-icons/md";
import EditProfile from "@/components/edit-profile";
import { User } from "@/components/renderPages";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import ProfileSkeleton from "@/components/skeletons/profileSkeleton";
import Follow from "@/components/ui/follow";
import AdditionalUserInfo from "@/components/ui/additionalUserInfo";
import FollowRequests from "@/components/ui/follow-requests";

const Page = ({ params }: { params: { tag: string } }) => {
  const [searchUser, SetSearchUser] = useState<User>();
  const router = useRouter();
  const [user, setUser] = useRecoilState(userState);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const response = await axios.get(`/api/users/getByTag/${params.tag}`);
      if (!response.data) router.push("/user-not-found");
      SetSearchUser(response.data);
      // Check if current user is following the profile user
      if (response.data && user.email !== response.data.email) {
        setIsFollowing(response.data.followers?.some((follower: any) => follower.id === user.id) || false);
      }
    };
    getUser();
  }, [user]);

  const date = new Date(
    searchUser?.createdAt ? searchUser?.createdAt : "2023-09-11T07:14:21.552Z"
  );
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

  if (!searchUser) {
    return <ProfileSkeleton />;
  }

  const isPrivateProfile = searchUser.isPrivate && !isFollowing && searchUser.email !== user.email;

  return (
    <div className="page relative flex w-full flex-col gap-4">
      {searchUser?.email === user.email && <EditProfile />}
      {searchUser?.email !== user.email && (
        <div className=" absolute right-2 top-28 sm:right-4">
          <Follow user={searchUser} />
        </div>
      )}

      {searchUser?.email === user.email && <FollowRequests userId={user.id} />}

      {searchUser?.bgImage ? (
        <Image
          src={
            searchUser?.bgImage ||
            "https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?cs=srgb&dl=pexels-francesco-ungaro-281260.jpg&fm=jpg"
          }
          width={100}
          height={50}
          alt=""
          className=" -z-20  h-24 w-full object-cover "
        />
      ) : (
        <div className=" h-24 w-full bg-blue-400"></div>
      )}

      <div className=" mx-4 -mt-16 w-fit rounded-full bg-lightTheme  dark:bg-darkTheme">
        <ProfileImage src={searchUser?.imageUrl || ""} size={120} />
      </div>
      <div className=" flex flex-col gap-4 border-b-2 px-4 pb-4">
        <div className=" flex items-center gap-2">
          <p className=" text-2xl font-bold">{searchUser?.name}</p>
          {searchUser.isVerified && (
            <div className=" text-2xl font-extrabold text-yellow-400">
              <MdVerified />
            </div>
          )}
        </div>
        <p className=" -mt-4 dark:text-darkGray">@{searchUser?.tag}</p>
        <p>{searchUser?.about}</p>
        <div className=" flex items-center gap-2 text-sm text-darkGray">
          <SlCalender /> <p>Joined on {formattedDate}</p>
        </div>
        <div className=" flex w-full gap-4 px-4">
          <Link
            className=" flex items-center gap-2"
            href={`/${searchUser?.tag}?tab=following`}
            scroll={false}
          >
            <span className=" text-xl font-bold">
              {searchUser.following?.length}
            </span>
            Following
          </Link>
          <Link
            className=" flex items-center gap-2"
            href={`/${searchUser?.tag}?tab=followers`}
            scroll={false}
          >
            <span className=" text-xl font-bold">
              {searchUser.followers?.length}
            </span>
            Followers
          </Link>
        </div>
      </div>
      {isPrivateProfile ? (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">This account is private</h3>
          <p className="text-gray-500 dark:text-gray-400">Follow this user to see their posts</p>
        </div>
      ) : (
        <AdditionalUserInfo searchUser={searchUser} tag={params.tag} />
      )}
    </div>
  );
};
export default Page;
