import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  
  // Dashboard routes to protect
  const protectedRoutes = ["/academic", "/confessions", "/marketplace", "/events"];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (request.nextUrl.pathname === "/login" && sessionToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/academic";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
