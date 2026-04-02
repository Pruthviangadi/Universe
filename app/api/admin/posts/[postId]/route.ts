import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Hide post
export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { action } = await request.json();

    if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const post = await prisma.posts.update({
      where: { id: params.postId },
      data: {
        isHidden: action === 'hide'
      }
    });

    return new NextResponse(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.error("[ADMIN_POST_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 