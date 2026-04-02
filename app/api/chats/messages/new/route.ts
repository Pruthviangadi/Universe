import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";

export const POST = async (req: any) => {
  const body = await req.json();
  try {
    // Format document data if it exists
    const documentData = body.document && body.document.length > 0 
      ? body.document.map((doc: any) => ({
          url: doc.url,
          name: doc.name
        }))
      : null;

    const message = await prisma.messages.create({
      data: {
        chatRoomId: body.id,
        UserEmail: body.email,
        text: body.text || null,
        image: body.image || null,
        video: body.video || null,
        document: documentData,
      },
      include: {
        user: true,
      },
    });

    await pusherServer.trigger(body.id, "Message", JSON.stringify(message));

    // Notify all other chat members
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: body.id },
      include: { members: true },
    });
    if (chatRoom) {
      for (const member of chatRoom.members) {
        if (member.email !== body.email) {
          await prisma.notification.create({
            data: {
              userId: member.id,
              type: 'message',
              message: `${message.user.name || 'Someone'} sent you a message.`,
              link: `/chats/${body.id}`,
            },
          });
        }
      }
    }

    await prisma.chatRoom.update({
      where: {
        id: body.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return new NextResponse(JSON.stringify(message));
  } catch (error: any) {
    console.error("Error creating message:", error);
    return new NextResponse(JSON.stringify({ error: error.message || 'An error occurred' }), { status: 500 });
  }
};
