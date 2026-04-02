import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const notifications = await prisma.notification.findMany({
    where: { userId: userId! },
    orderBy: { createdAt: "desc" },
  });

  return new NextResponse(JSON.stringify(notifications));
}

export async function POST(request: Request) {
  try {
    const { userId, message, link, type } = await request.json();

    if (!userId || !message || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        link,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    // Trigger real-time notification
    await pusherServer.trigger(
      `user-${userId}-notifications`,
      "new-notification",
      JSON.stringify(notification)
    );

    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 