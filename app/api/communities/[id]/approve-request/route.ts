import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const POST = async (req: Request, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const userId = body.userId;
  if (!userId) return new NextResponse("Missing userId", { status: 400 });
  try {
    // Update join request status
    await prisma.communityJoinRequest.update({
      where: { communityId_userId: { communityId: params.id, userId } },
      data: { status: "approved" },
    });
    // Add user to community members
    await prisma.community.update({
      where: { id: params.id },
      data: {
        members: { connect: { id: userId } },
      },
    });
    return new NextResponse(JSON.stringify({ success: true }));
  } catch (error) {
    return new NextResponse("error", { status: 400 });
  }
}; 