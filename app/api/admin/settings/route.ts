import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/settings
export async function GET() {
  let settings = await prisma.adminSettings.findFirst();
  if (!settings) {
    settings = await prisma.adminSettings.create({
      data: {},
    });
  }
  return NextResponse.json(settings);
}

// PUT /api/admin/settings
export async function PUT(request: Request) {
  const body = await request.json();
  let settings = await prisma.adminSettings.findFirst();
  if (!settings) {
    settings = await prisma.adminSettings.create({ data: {} });
  }
  const updated = await prisma.adminSettings.update({
    where: { id: settings.id },
    data: {
      darkMode: body.darkMode,
      emailAlerts: body.emailAlerts,
      sessionTimeout: body.sessionTimeout,
    },
  });
  return NextResponse.json(updated);
} 