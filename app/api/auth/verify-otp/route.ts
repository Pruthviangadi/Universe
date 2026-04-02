import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Find the most recent OTP for this email that hasn't expired
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verification) {
      return NextResponse.json(
        { verified: false, error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Delete the used OTP
    await prisma.emailVerification.delete({
      where: {
        id: verification.id,
      },
    });

    // Clean up expired OTPs for this email
    await prisma.emailVerification.deleteMany({
      where: {
        email,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
} 