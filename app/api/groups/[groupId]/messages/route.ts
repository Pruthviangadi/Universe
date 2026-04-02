import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get group messages
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!groupMember) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId: params.groupId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// Send a message to the group
export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, imageUrl, videoUrl, document } = await req.json();

    // Check if user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!groupMember) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format document data if it exists
    const documentData = document && document.length > 0 
      ? document.map((doc: { url: string; name: string }) => ({
          url: doc.url,
          name: doc.name
        }))
      : null;

    const message = await prisma.groupMessage.create({
      data: {
        content,
        imageUrl,
        videoUrl,
        document: documentData,
        groupId: params.groupId,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
} 