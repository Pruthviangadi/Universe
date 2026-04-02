import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if the user is a member of this chat room
    const chatRoomMembership = await prisma.chatRoom.findFirst({
      where: {
        id: id,
        members: {
          some: {
            email: session.user.email
          }
        }
      }
    });

    if (!chatRoomMembership) {
      return new NextResponse("You are not a member of this chat room", { status: 403 });
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: id,
      },
      select: {
        members: {
          where: {
            email: { not: session.user.email },
          },
          select: {
            name: true,
            imageUrl: true,
            tag: true,
            id: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                name: true,
                imageUrl: true,
                tag: true,
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!chatRoom) {
      return new NextResponse("Chat room not found", { status: 404 });
    }

    // Ensure we have default values for messages and members
    const response = {
      messages: chatRoom.messages || [],
      members: chatRoom.members || []
    };

    return new NextResponse(JSON.stringify(response));
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
