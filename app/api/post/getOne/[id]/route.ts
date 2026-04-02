import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

    const post = await prisma.posts.findFirst({
      where: {
        id: id,
        OR: [
          { isHidden: false },
          ...(isAdmin ? [{ isHidden: true }] : [])
        ]
      },
      include: {
        likedBy: true,
        savedby: true,
        user: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    return new NextResponse(JSON.stringify(post));
  } catch (error) {
    return new NextResponse("error");
  }
};
