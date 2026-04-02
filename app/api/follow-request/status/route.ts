import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const fromUserId = searchParams.get("fromUserId");
    const toUserId = searchParams.get("toUserId");

    if (!fromUserId || !toUserId) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const request = await prisma.followRequest.findFirst({
      where: {
        fromUserId,
        toUserId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!request) {
      return new NextResponse(JSON.stringify({ status: "none" }));
    }

    return new NextResponse(JSON.stringify(request));
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}; 