import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is in the group
    const groupMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: user.id,
        },
      },
    });

    if (!groupMember) {
      return new NextResponse("User is not a member of this group", { status: 404 });
    }

    // Check if user is not an admin
    if (groupMember.role === "admin") {
      return new NextResponse("Admins cannot leave the group. Transfer admin role first.", { status: 403 });
    }

    // Remove user from the group
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: user.id,
        },
      },
    });

    return new NextResponse("Successfully left the group", { status: 200 });
  } catch (error) {
    console.error("Error leaving group:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 