import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "pruthviangadi47@gmail.com";

export async function POST(req: Request) {
  try {
    const user = await req.json();
    
    // Check if user with email already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: user.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // Set role based on email
    const role = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";

    // Create new user
    const createUser = await prisma.users.create({
      data: {
        name: user.name,
        email: user.email,
        usn: user.usn || null,
        password: await bcrypt.hash(user.password, 10),
        imageUrl: user.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?20170328184010",
        about: user.about || "Student at the university",
        tag: user.tag || user.usn || user.email.split("@")[0] + Math.floor(Math.random() * 1000),
        role: role,
        isVerified: role === "ADMIN",
      },
    });

    return NextResponse.json("Created New Account", { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
