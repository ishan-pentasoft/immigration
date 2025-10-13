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

  if (pathname.startsWith("/api/associate/auth")) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/associate/user-details/") &&
    request.method === "POST"
  ) {
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

  // 🔒 Protect /api/associate routes
  if (pathname.startsWith("/api/associate")) {
    const token =
      request.cookies.get("associateToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let associateId: string | undefined;
    try {
      const base64Url = token.split(".")[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = atob(base64);
        const payload = JSON.parse(payloadJson);
        associateId = payload?.associateId as string | undefined;
      }
    } catch {}

    const requestHeaders = new Headers(request.headers);
    if (associateId) {
      requestHeaders.set("x-associate-id", associateId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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

  // 🔒 Protect /associate dashboard routes
  if (pathname.startsWith("/associate")) {
    const token =
      request.cookies.get("associateToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (pathname === "/associate") {
      if (token) {
        return NextResponse.redirect(
          new URL("/associate/dashboard", request.url)
        );
      } else {
        return NextResponse.redirect(new URL("/associate-login", request.url));
      }
    }

    if (pathname === "/associate-login" && token) {
      return NextResponse.redirect(
        new URL("/associate/dashboard", request.url)
      );
    }

    if (pathname !== "/associate-login" && !token) {
      return NextResponse.redirect(new URL("/associate-login", request.url));
    }

    // 🔒 Role-based guard: only DIRECTOR can access staff, logs, and notice pages
    if (
      (token && pathname.startsWith("/associate/staff")) ||
      pathname.startsWith("/associate/logs") ||
      pathname.startsWith("/associate/notice")
    ) {
      try {
        const base64Url = token?.split(".")[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
          );
          const payloadJson = atob(padded);
          const payload = JSON.parse(payloadJson);
          const role = payload?.role as string | undefined;
          if (role !== "DIRECTOR") {
            return NextResponse.redirect(
              new URL("/associate/dashboard", request.url)
            );
          }
        } else {
          return NextResponse.redirect(
            new URL("/associate/dashboard", request.url)
          );
        }
      } catch {
        return NextResponse.redirect(
          new URL("/associate/dashboard", request.url)
        );
      }
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
