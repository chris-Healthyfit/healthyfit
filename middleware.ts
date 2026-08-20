import { NextRequest, NextResponse } from "next/server";
import {
  getAdminLoginPath,
  verifySessionToken,
} from "@/lib/admin-auth";
import { canAccessClub } from "@/lib/club-access";
import { CLUB_BASE_PATH, CLUB_LOGIN_PATH } from "@/lib/club-config";

const ADMIN_LOGIN_PATH = getAdminLoginPath();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("admin")?.value;
  const session = await verifySessionToken(token);
  const authenticated = !!session;
  const superAdmin = session?.role === "SUPER_ADMIN";
  const clubAccess = canAccessClub(session);

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    (pathname.startsWith("/admin/admins") ||
      pathname.startsWith("/admin/historique") ||
      pathname.startsWith("/admin/comptes-coach")) &&
    !superAdmin
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/admin") && !authenticated) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.url));
  }

  if (pathname.startsWith("/espace-club") && !clubAccess) {
    return NextResponse.redirect(new URL(CLUB_LOGIN_PATH, req.url));
  }

  if (pathname === CLUB_LOGIN_PATH && clubAccess) {
    return NextResponse.redirect(new URL(CLUB_BASE_PATH, req.url));
  }

  if (
    (pathname.startsWith("/espace-club/finances") ||
      pathname.startsWith("/espace-club/comptabilite") ||
      pathname.startsWith("/api/club/finance")) &&
    !superAdmin
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/espace-club", req.url));
  }

  if (
    (pathname.startsWith("/api/admins") ||
      pathname.startsWith("/api/audit")) &&
    !superAdmin
  ) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (pathname.startsWith("/api/admin/") && !authenticated) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  if (pathname.startsWith("/api/club/") && !clubAccess) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  if (
    (pathname.startsWith("/api/coachs") ||
      pathname.startsWith("/api/seances") ||
      pathname.startsWith("/api/contact") ||
      pathname.startsWith("/api/galerie") ||
      pathname.startsWith("/api/nutrition") ||
      pathname.startsWith("/api/temoignages") ||
      pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/reservations/")) &&
    req.method !== "GET"
  ) {
    if (!authenticated) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/espace-club/:path*",
    "/login",
    "/portail",
    "/portail-club",
    "/api/admins/:path*",
    "/api/audit",
    "/api/admin/:path*",
    "/api/club/:path*",
    "/api/coachs/:path*",
    "/api/seances/:path*",
    "/api/contact/:path*",
    "/api/galerie/:path*",
    "/api/nutrition/:path*",
    "/api/temoignages/:path*",
    "/api/upload/:path*",
    "/api/reservations/:path*",
  ],
};
