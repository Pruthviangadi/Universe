import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, internalNote } = await req.json();
    const data: any = {};
    if (status) data.status = status;
    if (internalNote !== undefined) data.internalNote = internalNote;
    const updated = await prisma.helpMessage.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update help message." }, { status: 500 });
  }
} 