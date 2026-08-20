import { NextResponse } from "next/server";
import { getSessionFromRequest, isSuperAdmin } from "@/lib/admin-auth";
import { canAccessClub, getCoachFilterId } from "@/lib/club-access";
import { getClubAlarmes } from "@/lib/club/alarmes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const coachFilter = getCoachFilterId(session);
  const alarmes = await getClubAlarmes(coachFilter, isSuperAdmin(session));

  return NextResponse.json(alarmes);
}
