import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canViewFinances, getCoachFilterId } from "@/lib/club-access";
import { getSeanceClubStats, formatSeanceLabel } from "@/lib/club/seances-collectives";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const seanceId = Number(id);
  const coachFilter = getCoachFilterId(session);

  const seance = await prisma.seanceClub.findUnique({
    where: { id: seanceId },
    include: {
      coach: { select: { id: true, prenom: true, nom: true } },
      presences: {
        orderBy: { date: "desc" },
        include: {
          member: { select: { id: true, prenom: true, nom: true, estVip: true } },
        },
      },
    },
  });

  if (!seance) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (coachFilter != null && seance.coachId !== coachFilter) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const stats = await getSeanceClubStats(seanceId);
  const showFinances = canViewFinances(session);

  return NextResponse.json({
    ...seance,
    titre: formatSeanceLabel(seance.horaire, seance.label),
    stats: {
      presences: stats.presences,
      recetteCentimes: showFinances ? stats.recetteCentimes : undefined,
      beneficeCentimes: showFinances ? stats.beneficeCentimes : undefined,
    },
    presences: seance.presences.map((p) => ({
      ...p,
      montantCentimes: showFinances ? p.montantCentimes : undefined,
      beneficeCentimes: showFinances ? p.beneficeCentimes : undefined,
    })),
  });
}
