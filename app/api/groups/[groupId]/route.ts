import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Get group details
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

// Update group details
export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, imageUrl } = await req.json();

    // Check if user is admin
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        user: {
          email: session.user.email,
        },
        role: "admin",
      },
    });

    if (!groupMember) {
      return NextResponse.json(
        { error: "Only admins can update group details" },
        { status: 403 }
      );
    }

    const updatedGroup = await prisma.group.update({
      where: { id: params.groupId },
      data: {
        name,
        imageUrl,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// Delete group
export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        user: {
          email: session.user.email,
        },
        role: "admin",
      },
    });

    if (!groupMember) {
      return NextResponse.json(
        { error: "Only admins can delete the group" },
        { status: 403 }
      );
    }

    await prisma.group.delete({
      where: { id: params.groupId },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
} 