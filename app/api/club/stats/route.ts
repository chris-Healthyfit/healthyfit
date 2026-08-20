import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest, isSuperAdmin } from "@/lib/admin-auth";
import { canAccessClub, getCoachFilterId } from "@/lib/club-access";
import {
  getAdminDashboardStats,
  getCoachDashboardStats,
} from "@/lib/club/stats";
import { getClubAlarmes } from "@/lib/club/alarmes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const coachFilter = getCoachFilterId(session);
  const memberWhere =
    coachFilter != null ? { coachReferentId: coachFilter } : {};

  const [membres, clients, nonClients, stockAlertes] = await Promise.all([
    prisma.clubMember.count({ where: { ...memberWhere, actif: true } }),
    prisma.clubMember.count({
      where: { ...memberWhere, actif: true, estClient: true },
    }),
    prisma.clubMember.count({
      where: { ...memberWhere, actif: true, estClient: false },
    }),
    isSuperAdmin(session)
      ? prisma.stockItem
          .findMany()
          .then((items) => items.filter((i) => i.quantite <= i.seuilAlerte).length)
      : Promise.resolve(0),
  ]);

  const dashboard = isSuperAdmin(session)
    ? await getAdminDashboardStats()
    : session?.coachId
      ? await getCoachDashboardStats(session.coachId)
      : null;

  const alarmes = await getClubAlarmes(coachFilter, isSuperAdmin(session));

  return NextResponse.json({
    membres,
    clients,
    nonClients,
    stockAlertes,
    dashboard,
    alarmes,
    isAdmin: isSuperAdmin(session),
  });
}
