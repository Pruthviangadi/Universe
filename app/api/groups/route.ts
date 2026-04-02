import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Create a new group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, imageUrl, memberEmails } = await req.json();

    // Get the creator's user ID
    const creator = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name,
        imageUrl,
        createdBy: creator.id,
        members: {
          create: [
            // Add creator as admin
            {
              user: { connect: { id: creator.id } },
              role: "admin",
            },
            // Add other members
            ...memberEmails.map((email: string) => ({
              user: {
                connect: { email },
              },
              role: "member",
            })),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}

// Get all groups for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
      include: {
        groups: {
          include: {
            group: {
              include: {
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = user.groups.map((groupMember) => groupMember.group);

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
} 