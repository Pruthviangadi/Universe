import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the message
    const message = await prisma.groupMessage.findUnique({
      where: { id: params.messageId },
      include: { user: true },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Allow sender or group admin to delete
    const groupAdmin = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        user: { email: session.user.email },
        role: "admin",
      },
    });
    if (message.user.email !== session.user.email && !groupAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.groupMessage.delete({
      where: { id: params.messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
} 