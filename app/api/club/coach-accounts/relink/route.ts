import { NextResponse } from "next/server";
import { getSessionFromRequest, isSuperAdmin } from "@/lib/admin-auth";
import { relinkOrphanCoachAccounts } from "@/lib/club/relink-coach-accounts";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const results = await relinkOrphanCoachAccounts();
  return NextResponse.json({ results });
}
