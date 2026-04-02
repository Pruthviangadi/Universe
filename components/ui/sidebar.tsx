"use client";

import ThemeToggleButton from "./ThemeToggleButton";
import { BiHomeCircle, BiSearchAlt, BiBell, BiLogOut, BiHelpCircle } from "react-icons/bi";
import { BsChatDots, BsPeople, BsBookmark } from "react-icons/bs";
import { MdAdminPanelSettings } from "react-icons/md";
import Link from "next/link";
import Logo from "./logo";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRecoilState } from "recoil";
import { userState } from "@/state/atoms/userState";
import ProfileImage from "./profileImage";
import { FaBullhorn } from "react-icons/fa";
import { FaRegCalendarAlt } from "react-icons/fa";
import HelpModal from "@/components/ui/HelpModal";
import { useState } from "react";

const ADMIN_EMAIL = "pruthviangadi47@gmail.com"; // Admin email address

const Sidebar = ({ compact = false }: { compact?: boolean }) => {
  const [user, setUser] = useRecoilState(userState);
  const [helpOpen, setHelpOpen] = useState(false);
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <aside className={`col-start-1 hidden h-screen flex-col items-center gap-4 overflow-x-hidden overflow-y-scroll border-r-2 border-lightGray bg-lightTheme px-4 py-8 text-xl font-bold dark:border-slate-800 dark:bg-darkTheme sm:col-end-3 sm:flex sm:gap-6 md:col-end-3 lg:col-end-3 lg:items-start ${compact ? 'w-[301px]' : 'w-full'}`}>
      <Link href="/home">
        <Logo text={false} brandName="UniVerse" />
      </Link>
      <NavLinks text="Home" URL="/home">
        <BiHomeCircle />
      </NavLinks>
      <NavLinks text="Explore" URL="/explore">
        <BiSearchAlt />
      </NavLinks>
      <NavLinks text="Notifications" URL="/notifications">
        <BiBell />
      </NavLinks>
      <NavLinks text="Chats" URL="/chats">
        <BsChatDots />
      </NavLinks>
      <NavLinks text="Groups" URL="/groups">
        <BsPeople />
      </NavLinks>
      <NavLinks text="Communities" URL="/communities">
        <BsPeople />
      </NavLinks>
      <NavLinks text="Announcements" URL="/announcements">
        <FaBullhorn />
      </NavLinks>
      <NavLinks text="Events" URL="/calendar">
        <FaRegCalendarAlt />
      </NavLinks>
      {user?.savedPosts && (
        <NavLinks text="Saves" URL="/saves">
          <BsBookmark />
        </NavLinks>
      )}
      {user?.imageUrl && (
        <NavLinks text="Profile" URL={`/${user.tag}`}>
          <ProfileImage src={user?.imageUrl} size={40} />
        </NavLinks>
      )}
      {isAdmin && (
        <NavLinks text="Admin" URL="/admin">
          <MdAdminPanelSettings className="text-2xl text-yellow-500" />
        </NavLinks>
      )}

      <div className=" grid w-full justify-center gap-4 lg:block">
        <ThemeToggleButton />
        <Link
          href="/post"
          className=" flex w-full items-center justify-center gap-2 rounded-full bg-darkTheme p-2 text-xs text-lightTheme dark:bg-extraLightGray dark:text-darkTheme lg:mt-4"
        >
          <p className=" text-xl font-bold">+</p>
          <p className="hidden  font-medium lg:inline">Post</p>
        </Link>
      </div>

      <div className="mt-auto flex items-center gap-4 w-full justify-center border-t pt-4 border-gray-200 dark:border-slate-700">
        <button
          className="flex items-center gap-2 px-2 py-1 rounded text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-800 font-semibold transition text-base"
          onClick={() => {
            signOut({ 
              callbackUrl: '/',
              redirect: true 
            }).catch((error) => {
              console.error('Sign out error:', error);
            });
          }}
        >
          <BiLogOut className="text-xl" />
          <span className="hidden text-xs font-medium lg:inline">Sign Out</span>
        </button>
        <span className="h-6 w-px bg-gray-300 dark:bg-slate-600 mx-2" />
        <button
          className="flex items-center gap-1 px-2 py-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold transition text-sm"
          onClick={() => setHelpOpen(true)}
        >
          <BiHelpCircle className="text-lg" /> Help
        </button>
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </aside>
  );
};
export default Sidebar;

export const NavLinks = ({
  children,
  URL,
  text,
}: {
  children: React.ReactNode;
  URL: string;
  text: string;
}) => {
  const pathname = usePathname();
  const active = pathname.split("/")[1];

  return (
    <Link
      href={URL}
      className={` ${
        active === text.toLocaleLowerCase()
          ? " text-2xl font-extrabold sm:text-base"
          : " text-lg font-normal sm:text-sm"
      } flex items-center gap-2 duration-300 ease-out `}
    >
      {children}
      <p className=" hidden lg:inline">{text}</p>
    </Link>
  );
};
