import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    console.log('FOLLOW-REQUEST POST BODY:', body);
    const { fromUserId, toUserId } = body;

    // Check if the target user is private
    const targetUser = await prisma.users.findUnique({
      where: { id: toUserId },
    });

    if (!targetUser) {
      console.log('Target user not found');
      return new NextResponse("User not found", { status: 404 });
    }

    if (!targetUser.isPrivate) {
      // If not private, directly follow
      await prisma.users.update({
        where: { id: fromUserId },
        data: {
          following: {
            connect: { id: toUserId },
          },
        },
      });

      await prisma.users.update({
        where: { id: toUserId },
        data: {
          followers: {
            connect: { id: fromUserId },
          },
        },
      });

      return new NextResponse("Followed successfully");
    }

    // Check if request already exists
    const existingRequest = await prisma.followRequest.findFirst({
      where: {
        fromUserId,
        toUserId,
      },
    });

    if (existingRequest) {
      console.log('Follow request already exists:', existingRequest);
      return new NextResponse("Follow request already exists", { status: 400 });
    }

    // Create follow request
    const newRequest = await prisma.followRequest.create({
      data: {
        fromUserId,
        toUserId,
        status: "pending",
      },
    });
    console.log('Created new follow request:', newRequest);

    return new NextResponse(JSON.stringify({ id: newRequest.id }));
  } catch (error) {
    console.log('FOLLOW-REQUEST POST ERROR:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (req: Request) => {
  try {
    const { requestId, status } = await req.json();

    const request = await prisma.followRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (status === "accepted") {
      // Add to followers/following
      await prisma.users.update({
        where: { id: request.fromUserId },
        data: {
          following: {
            connect: { id: request.toUserId },
          },
        },
      });

      await prisma.users.update({
        where: { id: request.toUserId },
        data: {
          followers: {
            connect: { id: request.fromUserId },
          },
        },
      });
    }

    return new NextResponse("Request updated successfully");
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const requests = await prisma.followRequest.findMany({
      where: {
        toUserId: userId,
        status: "pending",
      },
      include: {
        fromUser: true,
      },
    });

    return new NextResponse(JSON.stringify(requests));
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}; 