import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest) {
  return req.cookies.get("admin")?.value === "connected";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protection de l'administration
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated(req)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protection des API uniquement pour les modifications
  if (
    (
      pathname.startsWith("/api/coachs") ||
      pathname.startsWith("/api/seances") ||
      pathname.startsWith("/api/club") ||
      pathname.startsWith("/api/contact") ||
      pathname.startsWith("/api/galerie") ||
      pathname.startsWith("/api/nutrition") ||
      pathname.startsWith("/api/temoignages") ||
      pathname.startsWith("/api/upload")
    ) &&
    req.method !== "GET"
  ) {
    if (!isAuthenticated(req)) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/coachs/:path*",
    "/api/seances/:path*",
    "/api/club/:path*",
    "/api/contact/:path*",
    "/api/galerie/:path*",
    "/api/nutrition/:path*",
    "/api/temoignages/:path*",
    "/api/upload/:path*",
  ],
};