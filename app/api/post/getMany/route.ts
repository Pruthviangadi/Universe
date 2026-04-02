import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const revalidate = 5;

export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: { following: true }
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

    const posts = await prisma.posts.findMany({
      where: {
        AND: [
          {
            OR: [
              // Posts from public accounts
              {
                user: {
                  isPrivate: false
                }
              },
              // Posts from private accounts where the current user is a follower
              {
                user: {
                  isPrivate: true,
                  followers: {
                    some: {
                      id: currentUser.id
                    }
                  }
                }
              },
              // User's own posts
              {
                UserEmail: currentUser.email
              }
            ]
          },
          {
            OR: [
              { isHidden: false },
              ...(isAdmin ? [{ isHidden: true }] : [])
            ]
          }
        ]
      },
      include: {
        user: true,
        likedBy: true,
        savedby: true,
        comments: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(JSON.stringify(posts));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new NextResponse("error", { status: 500 });
  }
};
