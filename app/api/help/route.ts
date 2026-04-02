import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, message } = await req.json();
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required." }, { status: 400 });
    }
    const help = await prisma.helpMessage.create({
      data: { email, message },
    });
    return NextResponse.json({ success: true, help });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit help message." }, { status: 500 });
  }
} 