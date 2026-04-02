import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "pruthviangadi47@gmail.com";

export async function POST(req: Request) {
  try {
    const { email, usn } = await req.json();

    if (!email || !usn) {
      return NextResponse.json(
        { error: "Email and USN are required" },
        { status: 400 }
      );
    }

    // Allow admin email to bypass pre-approval check
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ isApproved: true });
    }

    // Check if the email and USN combination exists in PreApprovedStudent
    const preApprovedStudent = await prisma.preApprovedStudent.findFirst({
      where: {
        email: email,
        usn: usn,
      },
    });

    if (!preApprovedStudent) {
      return NextResponse.json(
        { isApproved: false, error: "Email and USN do not match our records" },
        { status: 400 }
      );
    }

    return NextResponse.json({ isApproved: true });
  } catch (error) {
    console.error("Error checking pre-approved student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 