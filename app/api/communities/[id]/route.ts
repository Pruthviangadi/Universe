import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    if (!userId && session?.user?.email) {
      const user = await prisma.users.findUnique({ where: { email: session.user.email } });
      userId = user?.id;
    }
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        communityPosts: { include: { user: true } },
        members: true,
        admin: true,
        joinRequests: { include: { user: true } },
      },
    });
    if (!community) return new NextResponse("Not found", { status: 404 });
    console.log('Session userId:', userId);
    console.log('Community admins:', community.admin.map((a) => a.id));
    const isAdmin = community.admin.some((a) => a.id === userId);
    if (
      community.isPrivate &&
      !community.members.some((m) => m.id === userId) &&
      !isAdmin &&
      !community.joinRequests.some((r) => r.userId === userId && r.status === "pending")
    ) {
      console.log('Returning minimal community object for user', userId);
      return new NextResponse(
        JSON.stringify({
          id: community.id,
          name: community.name,
          imageUrl: community.imageUrl,
          description: "This is a private community. Request to join to see more.",
          isPrivate: true,
          canRequest: true,
        })
      );
    }
    // Member, admin, or pending requester: show full info
    return new NextResponse(JSON.stringify(community));
  } catch (error) {
    return new NextResponse("error");
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  const body = await req.json();
  try {
    const updateData: any = {
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
    };
    if (typeof body.isPrivate === "boolean") {
      updateData.isPrivate = body.isPrivate;
    }
    const updated = await prisma.community.update({
      where: { id },
      data: updateData,
    });
    return new NextResponse(JSON.stringify(updated));
  } catch (error) {
    return new NextResponse("error", { status: 400 });
  }
};
