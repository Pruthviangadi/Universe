import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/admin/communities
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";

  const where: Prisma.CommunityWhereInput = {
    isPrivate: filter === "private" ? true : filter === "public" ? false : undefined,
    OR: [
      {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        description: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    ],
  };

  const [communities, total] = await Promise.all([
    prisma.community.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.community.count({ where }),
  ]);

  return NextResponse.json({
    communities,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/admin/communities
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, imageUrl, isPrivate } = body;

    // Check if community already exists
    const existingCommunity = await prisma.community.findUnique({
      where: { name },
    });

    if (existingCommunity) {
      return new NextResponse("Community already exists", { status: 400 });
    }

    // Create community
    const community = await prisma.community.create({
      data: {
        name,
        description,
        imageUrl,
        isPrivate,
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error("[COMMUNITIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH /api/admin/communities/[communityId]
export async function PATCH(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, imageUrl, isPrivate } = body;

    const community = await prisma.community.update({
      where: { id: params.communityId },
      data: {
        name,
        description,
        imageUrl,
        isPrivate,
      },
    });

    return NextResponse.json(community);
  } catch (error) {
    console.error("[COMMUNITY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/communities/[communityId]
export async function DELETE(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.community.delete({
      where: { id: params.communityId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COMMUNITY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 