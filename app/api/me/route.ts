import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canEditStock, canViewFinances } from "@/lib/club-access";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);

  if (!session) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  return NextResponse.json({
    adminId: session.adminId,
    prenom: session.prenom,
    nom: session.nom,
    identifiant: session.identifiant,
    role: session.role,
    coachId: session.coachId ?? null,
    isSuperAdmin: session.role === "SUPER_ADMIN",
    canAccessClub: canAccessClub(session),
    canViewFinances: canViewFinances(session),
    canEditStock: canEditStock(session),
  });
}
