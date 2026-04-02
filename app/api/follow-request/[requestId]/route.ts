import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const DELETE = async (
  req: Request,
  { params }: { params: { requestId: string } }
) => {
  try {
    const { requestId } = params;

    await prisma.followRequest.delete({
      where: {
        id: requestId,
      },
    });

    return new NextResponse("Follow request withdrawn successfully");
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}; 