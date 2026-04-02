import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Add members to group
export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberEmails } = await req.json();

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
        { error: "Only admins can add members" },
        { status: 403 }
      );
    }

    // Add new members (fetch userId for each email)
    const users = await prisma.users.findMany({
      where: { email: { in: memberEmails } },
      select: { id: true, email: true },
    });
    const userIdMap = Object.fromEntries(users.map(u => [u.email, u.id]));
    const data = memberEmails
      .map((email: string) => userIdMap[email] && ({
        groupId: params.groupId,
        userId: userIdMap[email],
        role: "member",
      }))
      .filter(Boolean);
    if (data.length === 0) {
      return NextResponse.json({ error: "No valid users found for provided emails." }, { status: 400 });
    }
    const newMembers = await prisma.groupMember.createMany({
      data,
      skipDuplicates: true,
    });
    return NextResponse.json(newMembers);
  } catch (error) {
    console.error("Error adding members:", error);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}

// Remove member from group
export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberEmail } = await req.json();

    // Get the user to be removed
    const userToRemove = await prisma.users.findUnique({
      where: { email: memberEmail },
    });

    if (!userToRemove) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is an admin
    const memberToRemove = await prisma.groupMember.findFirst({
      where: {
        groupId: params.groupId,
        userId: userToRemove.id,
        role: "admin",
      },
    });

    // If removing an admin, check if there are other admins
    if (memberToRemove?.role === "admin") {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: params.groupId,
          role: "admin",
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin" },
          { status: 400 }
        );
      }
    }

    // Remove the member
    await prisma.groupMember.deleteMany({
      where: {
        groupId: params.groupId,
        userId: userToRemove.id,
      },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// Update member role
export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { memberEmail, role } = await req.json();

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
        { error: "Only admins can change roles" },
        { status: 403 }
      );
    }

    // Get the user whose role is being changed
    const userToUpdate = await prisma.users.findUnique({
      where: { email: memberEmail },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the role
    const updatedMember = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: params.groupId,
          userId: userToUpdate.id,
        },
      },
      data: {
        role,
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
} 