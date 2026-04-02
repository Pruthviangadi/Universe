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
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First verify this user exists and matches the session
    const user = await prisma.users.findUnique({
      where: { id: id },
      select: { email: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify the requesting user is accessing their own chats
    if (user.email !== session.user.email) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const chats = await prisma.users.findUnique({
      where: {
        id: id,
      },
      select: {
        chatRooms: {
          include: {
            members: {
              where: {
                id: { not: id },
              },
              select: {
                name: true,
                imageUrl: true,
                tag: true,
                id: true,
              },
            },
            messages: {
              take: 1,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(chats));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
