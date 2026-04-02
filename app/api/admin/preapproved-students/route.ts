import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all pre-approved students
export async function GET() {
  try {
    const students = await prisma.preApprovedStudent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching pre-approved students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST new pre-approved student
export async function POST(req: Request) {
  try {
    const { email, usn } = await req.json();

    if (!email || !usn) {
      return NextResponse.json(
        { error: "Email and USN are required" },
        { status: 400 }
      );
    }

    // Check if email or USN already exists
    const existingStudent = await prisma.preApprovedStudent.findFirst({
      where: {
        OR: [
          { email: email },
          { usn: usn },
        ],
      },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student with this email or USN already exists" },
        { status: 400 }
      );
    }

    const student = await prisma.preApprovedStudent.create({
      data: {
        email,
        usn,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating pre-approved student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 