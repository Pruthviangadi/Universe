import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export const PUT = async (req: any) => {
  const body = await req.json();
  console.log('FOLLOW PUT BODY:', body);
  try {
    await prisma.users.update({
      where: {
        id: body.followedById,
      },
      data: {
        following: {
          connect: {
            id: body.followedToId,
          },
        },
      },
    });

    await prisma.users.update({
      where: {
        id: body.followedToId,
      },
      data: {
        followers: {
          connect: {
            id: body.followedById,
          },
        },
      },
    });

    // Send notification to followed user
    if (body.followedById !== body.followedToId) {
      const follower = await prisma.users.findUnique({ where: { id: body.followedById } });
      const notification = await prisma.notification.create({
        data: {
          userId: body.followedToId,
          type: 'follow',
          message: `${follower?.name || 'Someone'} started following you.`,
          link: `/${follower?.tag || ''}`,
        },
      });

      // Trigger real-time notification
      await pusherServer.trigger(
        `user-${body.followedToId}-notifications`,
        "new-notification",
        JSON.stringify(notification)
      );
    }
    return new NextResponse(JSON.stringify("followed"));
  } catch (error) {
    console.log('FOLLOW PUT ERROR:', error);
    return new NextResponse(JSON.stringify(error), { status: 403 });
  }
};

export const DELETE = async (req: any) => {
  const body = await req.json();
  try {
    await prisma.users.update({
      where: {
        id: body.fromUserId,
      },
      data: {
        following: {
          disconnect: {
            id: body.toUserId,
          },
        },
      },
    });

    await prisma.users.update({
      where: {
        id: body.toUserId,
      },
      data: {
        followers: {
          disconnect: {
            id: body.fromUserId,
          },
        },
      },
    });
    return new NextResponse(JSON.stringify("unfollowed"));
  } catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify(error), { status: 403 });
  }
};
