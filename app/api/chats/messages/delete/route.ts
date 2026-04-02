import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export const PUT = async (req: any) => {
  const body = await req.json();
  try {
    await prisma.messages.delete({
      where: {
        id: body.id,
      },
    });

    await pusherServer.trigger(
      body.chatRoomId,
      "Delete-Message",
      JSON.stringify({ id: body.id })
    );

    return new NextResponse(JSON.stringify("deleted"));
  } catch (error) {
    return new NextResponse(JSON.stringify(error), { status: 401 });
  }
};
