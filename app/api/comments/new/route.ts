import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: any) => {
  const body = await req.json();
  try {
    const comment = await prisma.comments.create({
      data: {
        postId: body.id,
        UserEmail: body.email,
        text: body.text,
      },
      include: {
        user: true,
      },
    });

    // Get the post and author
    const post = await prisma.posts.findUnique({
      where: { id: body.id },
      include: { user: true },
    });
    if (post && post.user.email !== body.email) {
      await prisma.notification.create({
        data: {
          userId: post.user.id,
          type: 'comment',
          message: `${comment.user.name || 'Someone'} commented on your post.`,
          link: `/post/${post.id}?tab=comments`,
        },
      });
    }
    return new NextResponse(JSON.stringify(comment));
  } catch (error) {
    return new NextResponse(JSON.stringify("error"));
  }
};
