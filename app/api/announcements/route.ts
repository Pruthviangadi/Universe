import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, content, category, attachments } = await req.json();
  if (!title || !content || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      category,
      attachments: attachments || [],
    },
  });
  return NextResponse.json(announcement);
} 