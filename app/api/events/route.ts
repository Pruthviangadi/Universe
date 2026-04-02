import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { start: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  const { title, description, location, start, end } = data;
  if (!title || !start || !end) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const event = await prisma.event.create({
    data: { title, description, location, start: new Date(start), end: new Date(end) },
  });
  return NextResponse.json(event);
} 