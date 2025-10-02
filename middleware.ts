import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // 🔒 Protect /api/admin routes
  if (pathname.startsWith("/api/admin")) {
    const token =
      request.cookies.get("adminToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // 🔒 Protect /admin dashboard routes
  if (pathname.startsWith("/admin")) {
    const token =
      request.cookies.get("adminToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (pathname === "/admin") {
      if (token) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    if (pathname === "/admin/login" && token) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (pathname !== "/admin/login" && !token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // ✅ Don’t skip /api/admin when filtering
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
