import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, getCoachFilterId } from "@/lib/club-access";
import { getTarifsMap, resolveDefaultPayment } from "@/lib/club/tarifs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const coachFilter = getCoachFilterId(session);
  const where: Record<string, unknown> = { actif: true };
  if (coachFilter != null) where.coachReferentId = coachFilter;

  const membres = await prisma.clubMember.findMany({
    where: {
      ...where,
      OR: [
        { prenom: { contains: q, mode: "insensitive" } },
        { nom: { contains: q, mode: "insensitive" } },
        { telephone: { contains: q } },
      ],
    },
    take: 12,
    orderBy: { prenom: "asc" },
    include: {
      coachReferent: { select: { id: true, prenom: true, nom: true } },
    },
  });

  const tarifs = await getTarifsMap();
  const results = membres.map((m) => ({
    ...m,
    paymentPreview: resolveDefaultPayment(m, tarifs),
  }));

  return NextResponse.json(results);
}
