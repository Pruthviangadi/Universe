import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Create a new report
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId, reason, description } = await request.json();

    const report = await prisma.report.create({
      data: {
        reason,
        description,
        post: {
          connect: {
            id: postId
          }
        },
        reporter: {
          connect: {
            email: session.user.email
          }
        },
        status: "pending"
      },
      include: {
        post: {
          include: {
            user: true
          }
        },
        reporter: true
      }
    });

    return new NextResponse(JSON.stringify(report), { status: 201 });
  } catch (error) {
    console.error("[REPORT_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Get reports with filter
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const reports = await prisma.report.findMany({
      where: {
        status,
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        reporter: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(JSON.stringify(reports), { status: 200 });
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update report status
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, status } = await request.json();

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return new NextResponse(JSON.stringify(report), { status: 200 });
  } catch (error) {
    console.error("[REPORT_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 