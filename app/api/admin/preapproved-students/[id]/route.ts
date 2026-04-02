import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.preApprovedStudent.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pre-approved student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { email, usn } = await req.json();
    if (!email || !usn) {
      return NextResponse.json(
        { error: "Email and USN are required" },
        { status: 400 }
      );
    }
    // Check for duplicate email or usn (excluding current record)
    const existing = await prisma.preApprovedStudent.findFirst({
      where: {
        id: { not: id },
        OR: [
          { email },
          { usn },
        ],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Student with this email or USN already exists" },
        { status: 400 }
      );
    }
    const updated = await prisma.preApprovedStudent.update({
      where: { id },
      data: { email, usn },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pre-approved student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 