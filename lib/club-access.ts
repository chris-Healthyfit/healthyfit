import type { AdminSession } from "@/lib/admin-auth";

export function canAccessClub(session: AdminSession | null) {
  return session?.role === "SUPER_ADMIN" || session?.role === "COACH";
}

export function canViewFinances(session: AdminSession | null) {
  return session?.role === "SUPER_ADMIN";
}

export function canManageTarifs(session: AdminSession | null) {
  return session?.role === "SUPER_ADMIN";
}

/** Pour un coach : filtre sur son coachId. Pour Chris/Sarah : null = tout voir. */
export function getCoachFilterId(session: AdminSession | null) {
  if (!session) return undefined;
  if (session.role === "COACH" && session.coachId) return session.coachId;
  if (session.role === "SUPER_ADMIN") return null;
  return undefined;
}

export function canEditStock(session: AdminSession | null) {
  return session?.role === "SUPER_ADMIN";
}

export function canViewScore(session: AdminSession | null, coachReferentId: number) {
  if (!session) return false;
  if (session.role === "SUPER_ADMIN") return true;
  if (session.role === "COACH" && session.coachId === coachReferentId) return true;
  return false;
}
