import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/admin/posts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";

  const where: Prisma.PostsWhereInput = {
    OR: [
      { text: { contains: search, mode: Prisma.QueryMode.insensitive } },
      { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
      { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
    ],
    ...(filter === "text" && { type: "text" }),
    ...(filter === "image" && { type: "image" }),
    ...(filter === "video" && { type: "video" }),
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

  return NextResponse.json({
    posts,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// DELETE /api/admin/posts/[postId]
export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.posts.delete({
      where: { id: params.postId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 