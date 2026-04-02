import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  
  // For debugging
  console.log("Middleware running for path:", request.nextUrl.pathname);
  console.log("Token:", token ? "Present" : "Not present");
  console.log("Admin email from env:", process.env.ADMIN_EMAIL);

  if (isAdminRoute) {
    // If no token, redirect to signin
    if (!token) {
      console.log("No token, redirecting to signin");
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // For development, allow access if ADMIN_EMAIL is not set
    if (!process.env.ADMIN_EMAIL) {
      console.log("ADMIN_EMAIL not set, allowing access for development");
      return NextResponse.next();
    }

    // Check if user email matches admin email
    if (token.email !== process.env.ADMIN_EMAIL) {
      console.log("User email doesn't match admin email, redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
}; 