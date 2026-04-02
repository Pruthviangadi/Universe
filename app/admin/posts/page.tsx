import prisma from "@/lib/prisma";
import PostTable from "@/components/admin/PostTable";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";

async function getPosts(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const search = searchParams.search as string || "";
  const filter = searchParams.filter as string || "all";

  const where: Prisma.PostsWhereInput = {
    type: filter === "text" ? "text" : filter === "image" ? "image" : filter === "video" ? "video" : undefined,
    OR: [
      {
        text: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        user: {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
    ],
  };

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    }),
    prisma.posts.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { posts, total, totalPages } = await getPosts(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Post Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <select className="px-4 py-2 border rounded-md">
            <option value="all">All Posts</option>
            <option value="text">Text Posts</option>
            <option value="image">Image Posts</option>
            <option value="video">Video Posts</option>
          </select>
        </div>

        <Suspense fallback={<div>Loading posts...</div>}>
          <PostTable posts={posts} />
        </Suspense>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <nav className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <a
                key={page}
                href={`/admin/posts?page=${page}`}
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