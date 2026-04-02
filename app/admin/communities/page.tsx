import prisma from "@/lib/prisma";
import CommunityTable from "@/components/admin/CommunityTable";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import CommunitySearchAndFilter from "@/components/admin/CommunitySearchAndFilter";

async function getCommunities(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const search = searchParams.search as string || "";
  const filter = searchParams.filter as string || "all";

  const where: Prisma.CommunityWhereInput = {
    OR: [
      { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
      { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
    ],
    ...(filter === "private" && { isPrivate: true }),
    ...(filter === "public" && { isPrivate: false }),
  };

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.community.count({ where }),
  ]);

  return {
    communities,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { communities, total, totalPages } = await getCommunities(searchParams);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-2">Community Management</h2>
      <p className="text-gray-500 mb-6">Manage and moderate communities across the platform.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CommunitySearchAndFilter />

        <Suspense fallback={<div>Loading communities...</div>}>
          <CommunityTable communities={communities} />
        </Suspense>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <nav className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/admin/communities?page=${page}`}
                className="px-3 py-1 border rounded-md hover:bg-gray-100"
              >
                {page}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
} 