'use client';

import { FaUsers, FaFileAlt, FaLayerGroup, FaCog, FaTachometerAlt, FaRegCalendarAlt, FaBullhorn, FaFlag, FaUserCheck, FaQuestionCircle } from "react-icons/fa";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const linkClass = (href: string) =>
    `flex items-center gap-2 p-2 rounded font-medium text-gray-700 transition ${
      pathname === href ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50'
    }`;

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <a href="/admin" className={linkClass('/admin')}>
          <FaTachometerAlt /> Dashboard
        </a>
        <a href="/admin/users" className={linkClass('/admin/users')}>
          <FaUsers /> Users
        </a>
        <a href="/admin/preapproved-students" className={linkClass('/admin/preapproved-students')}>
          <FaUserCheck /> Pre-Approved Students
        </a>
        <a href="/admin/help-messages" className={linkClass('/admin/help-messages')}>
          <FaQuestionCircle /> Help Messages
        </a>
        <a href="/admin/posts" className={linkClass('/admin/posts')}>
          <FaFileAlt /> Posts
        </a>
        <a href="/admin/reports" className={linkClass('/admin/reports')}>
          <FaFlag /> Reports
        </a>
        <a href="/admin/communities" className={linkClass('/admin/communities')}>
          <FaLayerGroup /> Communities
        </a>
        <a href="/admin/events" className={linkClass('/admin/events')}>
          <FaRegCalendarAlt /> Calendar
        </a>
        <a href="/admin/announcements" className={linkClass('/admin/announcements')}>
          <FaBullhorn /> Announcements
        </a>
        <a href="/admin/settings" className={linkClass('/admin/settings')}>
          <FaCog /> Settings
        </a>
      </nav>
      <div className="p-4 border-t">
        <AdminSignOutButton />
      </div>
    </aside>
  );
} 