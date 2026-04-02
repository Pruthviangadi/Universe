import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FaFlag, FaUsers, FaFileAlt, FaHome, FaUserFriends, FaQuestionCircle } from "react-icons/fa";

export default async function AdminPage() {
  // Fetch stats from the database
  const [userCount, postCount, communityCount, groupCount, pendingReportsCount, newHelpCount] = await Promise.all([
    prisma.users.count(),
    prisma.posts.count(),
    prisma.community.count(),
    prisma.group.count(),
    prisma.report.count({
      where: {
        status: "pending"
      }
    }),
    prisma.helpMessage.count({
      where: { status: "New" }
    })
  ]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <FaUsers className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{userCount}</div>
            <div className="text-gray-600 font-medium">Total Users</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <FaFileAlt className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{postCount}</div>
            <div className="text-gray-600 font-medium">Total Posts</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <FaUserFriends className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{communityCount}</div>
            <div className="text-gray-600 font-medium">Total Communities</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-yellow-100 p-3 rounded-full mb-4">
              <FaFlag className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{pendingReportsCount}</div>
            <div className="text-gray-600 font-medium">Pending Reports</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <FaQuestionCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{newHelpCount}</div>
            <div className="text-gray-600 font-medium">New Help Messages</div>
          </div>
        </div>
      </div>

      {pendingReportsCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-md mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
              <FaFlag className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-base text-red-800">
                <span className="font-semibold">Attention needed:</span>
                {' '}
                <a 
                  href="/admin/reports" 
                  className="font-bold hover:underline text-red-700"
                >
                  {pendingReportsCount} report{pendingReportsCount === 1 ? '' : 's'} pending review
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 