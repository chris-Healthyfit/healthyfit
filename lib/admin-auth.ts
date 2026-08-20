import { SignJWT, jwtVerify } from "jose";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-config";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "COACH";

export type AdminSession = {
  adminId: number;
  role: AdminRole;
  prenom: string;
  nom: string;
  identifiant: string;
  coachId?: number | null;
};

function getJwtSecret() {
  const secret =
    process.env.ADMIN_JWT_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "healthyfit-dev-secret";

  return new TextEncoder().encode(secret);
}

export function getAdminLoginPath() {
  return ADMIN_LOGIN_PATH;
}

export function getTokenFromRequest(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)admin=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function createSessionToken(session: AdminSession) {
  return new SignJWT({
    adminId: session.adminId,
    role: session.role,
    prenom: session.prenom,
    nom: session.nom,
    identifiant: session.identifiant,
    coachId: session.coachId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<AdminSession | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    const role = payload.role as AdminRole;
    if (
      typeof payload.adminId !== "number" ||
      (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "COACH") ||
      typeof payload.prenom !== "string" ||
      typeof payload.nom !== "string" ||
      typeof payload.identifiant !== "string"
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      role,
      prenom: payload.prenom,
      nom: payload.nom,
      identifiant: payload.identifiant,
      coachId:
        typeof payload.coachId === "number"
          ? payload.coachId
          : payload.coachId === null
            ? null
            : undefined,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

export async function getSessionFromRequest(req: Request) {
  return verifySessionToken(getTokenFromRequest(req));
}

export function isSuperAdmin(session: AdminSession | null) {
  return session?.role === "SUPER_ADMIN";
}

export function getLoginRedirect(
  session: AdminSession,
  context?: "admin" | "club"
) {
  if (context === "club") {
    if (session.role === "COACH" || session.role === "SUPER_ADMIN") {
      return "/espace-club";
    }
    return "/admin";
  }

  if (session.role === "COACH") return "/espace-club";
  return "/admin";
}
