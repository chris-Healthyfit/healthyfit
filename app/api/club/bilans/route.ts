import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, getCoachFilterId } from "@/lib/club-access";
import { compareBilans } from "@/lib/club/bilans";
import { refreshMemberScore } from "@/lib/club/stats";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const memberId = Number(body.memberId);
  if (!Number.isInteger(memberId)) {
    return NextResponse.json({ error: "Client requis" }, { status: 400 });
  }

  const member = await prisma.clubMember.findUnique({ where: { id: memberId } });
  if (!member) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const coachFilter = getCoachFilterId(session);
  if (coachFilter != null && member.coachReferentId !== coachFilter) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const num = (v: unknown) =>
    v === "" || v == null ? null : Number(v);

  const { getFinanceConfig } = await import("@/lib/finance/fit-cost");
  const config = await getFinanceConfig();
  const coutBilan = config.coutBilanCentimes;

  const bilan = await prisma.$transaction(async (tx) => {
    const created = await tx.bilan.create({
      data: {
        memberId,
        date: body.date ? new Date(body.date) : new Date(),
        coutCentimes: coutBilan,
        photoAvant: body.photoAvant?.trim() || member.photoAvant,
        photoApres: body.photoApres?.trim() || null,
        poids: num(body.poids),
        taille: num(body.taille),
        tourTaille: num(body.tourTaille),
        tourHanches: num(body.tourHanches),
        tourPoitrine: num(body.tourPoitrine),
        bras: num(body.bras),
        cuisse: num(body.cuisse),
        mollet: num(body.mollet),
        masseGrasse: num(body.masseGrasse),
        masseMusculaire: num(body.masseMusculaire),
        graisseViscerale:
          body.graisseViscerale != null && body.graisseViscerale !== ""
            ? Number(body.graisseViscerale)
            : null,
        eauCorporelle: num(body.eauCorporelle),
        ageMetabolique:
          body.ageMetabolique != null && body.ageMetabolique !== ""
            ? Number(body.ageMetabolique)
            : null,
        metabolismeBase:
          body.metabolismeBase != null && body.metabolismeBase !== ""
            ? Number(body.metabolismeBase)
            : null,
        checklistComplete: body.checklistComplete === true,
        notes: body.notes?.trim() || null,
      },
    });

    const { recordBilanFinance } = await import("@/lib/finance/ledger");
    await recordBilanFinance(
      { id: created.id, date: created.date, member: { prenom: member.prenom } },
      coutBilan,
      tx
    );

    return created;
  });

  if (body.photoApres) {
    await prisma.clubMember.update({
      where: { id: memberId },
      data: { photoApres: body.photoApres.trim() },
    });
  }
  if (body.photoAvant && !member.photoAvant) {
    await prisma.clubMember.update({
      where: { id: memberId },
      data: { photoAvant: body.photoAvant.trim() },
    });
  }

  const previous = await prisma.bilan.findFirst({
    where: { memberId, id: { not: bilan.id } },
    orderBy: { date: "desc" },
  });

  await refreshMemberScore(memberId);

  await auditMutation(req, {
    action: "CREATE",
    entity: "bilan",
    entityId: bilan.id,
    details: `${member.prenom} — bilan`,
  });

  return NextResponse.json(
    {
      bilan,
      comparaison: previous ? compareBilans(previous, bilan) : null,
    },
    { status: 201 }
  );
}
