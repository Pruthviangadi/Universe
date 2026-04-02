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

    const adminEmail = process.env.ADMIN_EMAIL;

    // Block access if ADMIN_EMAIL is not configured or user doesn't match
    if (!adminEmail || token.email !== adminEmail) {
      console.log("Access denied: user is not admin");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
}; 