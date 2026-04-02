import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    await prisma.community.delete({ where: { id: params.id } });
    return new NextResponse(JSON.stringify({ success: true }));
  } catch (error) {
    return new NextResponse("error", { status: 400 });
  }
}; 