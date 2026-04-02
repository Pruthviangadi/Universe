import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const userId = body.userId;
  if (!userId) return new NextResponse("Missing userId", { status: 400 });
  try {
    // Prevent duplicate requests
    const existing = await prisma.communityJoinRequest.findUnique({
      where: { communityId_userId: { communityId: params.id, userId } },
    });
    if (existing) {
      return new NextResponse(JSON.stringify(existing));
    }
    const joinRequest = await prisma.communityJoinRequest.create({
      data: {
        communityId: params.id,
        userId,
        status: "pending",
      },
    });

    // Fetch user and community with admins
    const user = await prisma.users.findUnique({ where: { id: userId } });
    const community = await prisma.community.findUnique({
      where: { id: params.id },
      include: { admin: true },
    });
    if (community && user) {
      for (const admin of community.admin) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "community-join-request",
            message: `${user.name} (@${user.tag}) requested to join ${community.name}`,
            link: `/communities/${community.id}/members`,
          },
        });
      }
    }
    return new NextResponse(JSON.stringify(joinRequest));
  } catch (error) {
    return new NextResponse("error", { status: 400 });
  }
}; 