import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Get the current user
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        following: true,
      },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get all posts
    const posts = await prisma.posts.findMany({
      include: {
        user: true,
        likedBy: true,
        savedby: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter posts based on privacy settings
    const filteredPosts = posts.filter((post) => {
      // If the post is from the current user, show it
      if (post.UserEmail === currentUser.email) {
        return true;
      }

      // If the post is from a public account, show it
      if (!post.user.isPrivate) {
        return true;
      }

      // If the post is from a private account, only show if the current user is following
      return currentUser.following.some((following) => following.id === post.user.id);
    });

    return new NextResponse(JSON.stringify(filteredPosts));
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const post = await req.json();
    const newPost = await prisma.posts.create({
      data: {
        type: post.type,
        text: post.text,
        image: post.image,
        video: post.video,
        UserEmail: post.UserEmail,
      },
    });
    return new NextResponse(JSON.stringify(newPost));
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}; 