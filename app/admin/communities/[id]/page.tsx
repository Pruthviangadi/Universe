import prisma from "@/lib/prisma"; 
import { notFound } from "next/navigation";
import Link from "next/link";

interface CommunityPageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: CommunityPageProps) {
  const community = await prisma.community.findUnique({
    where: { id: params.id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      },
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      }
    }
  });

  if (!community) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{community.name}</h1>
        <div className="space-x-4">
          <Link 
            href={`/admin/communities/${params.id}/edit`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Community
          </Link>
          <Link 
            href={`/admin/communities/${params.id}/members`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            View Members
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Community Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p className="mt-1">{community.description}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Privacy</label>
              <p className="mt-1">{community.isPrivate ? "Private" : "Public"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Last Updated</label>
              <p className="mt-1">{new Date(community.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admins</h2>
          <div className="space-y-4">
            {community.admin.map((admin) => (
              <div key={admin.id} className="flex items-center gap-4">
                <div>
                  <h3 className="font-medium">{admin.name}</h3>
                  <p className="text-sm text-gray-500">{admin.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 