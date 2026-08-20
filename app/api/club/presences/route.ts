import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canViewFinances, getCoachFilterId } from "@/lib/club-access";
import { createPresence, endOfDay, startOfDay } from "@/lib/club/presences";
import { vendreCarte } from "@/lib/club/cartes";
import { formatMontant } from "@/lib/club/tarifs";
import type { MotifOffert, PresenceMode } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const jour = searchParams.get("jour") === "1";
  const seanceClubId = searchParams.get("seanceClubId");
  const dateParam = searchParams.get("date");
  const coachFilter = getCoachFilterId(session);
  const showFinances = canViewFinances(session);

  const where: Record<string, unknown> = {};
  if (coachFilter != null) where.coachId = coachFilter;

  if (seanceClubId) {
    where.seanceClubId = Number(seanceClubId);
  } else if (dateParam) {
    where.seanceClub = {
      date: {
        gte: startOfDay(new Date(dateParam)),
        lte: endOfDay(new Date(dateParam)),
      },
    };
  } else if (jour) {
    where.date = { gte: startOfDay(), lte: endOfDay() };
  }

  const presences = await prisma.presence.findMany({
    where,
    orderBy: { date: "desc" },
    take: seanceClubId ? 500 : jour ? 200 : 100,
    include: {
      member: {
        select: { id: true, prenom: true, nom: true, estVip: true },
      },
      coach: { select: { id: true, prenom: true, nom: true } },
      seanceClub: { select: { id: true, horaire: true, label: true, date: true } },
    },
  });

  return NextResponse.json(
    presences.map((p) => ({
      ...p,
      montantCentimes: showFinances ? p.montantCentimes : undefined,
      beneficeCentimes: showFinances ? p.beneficeCentimes : undefined,
      coutFitCentimes: showFinances ? p.coutFitCentimes : undefined,
    }))
  );
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!canAccessClub(session) || !session) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const memberId = Number(body.memberId);
    const seanceClubId = Number(body.seanceClubId);

    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json({ error: "Client requis" }, { status: 400 });
    }
    if (!Number.isInteger(seanceClubId) || seanceClubId <= 0) {
      return NextResponse.json({ error: "Séance requise" }, { status: 400 });
    }

    const member = await prisma.clubMember.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const seanceClub = await prisma.seanceClub.findUnique({ where: { id: seanceClubId } });
    if (!seanceClub) {
      return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });
    }

    const coachFilter = getCoachFilterId(session);
    if (coachFilter != null && member.coachReferentId !== coachFilter) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const coachId =
      session.role === "COACH" && session.coachId
        ? session.coachId
        : seanceClub.coachId;

    if (!Number.isInteger(coachId) || coachId <= 0) {
      return NextResponse.json(
        { error: "Coach introuvable pour cette séance" },
        { status: 400 }
      );
    }

    let carteVendue: Awaited<ReturnType<typeof vendreCarte>> | null = null;

    if (body.vendreCarte === true) {
      carteVendue = await vendreCarte({
        memberId,
        estVip: body.estVip === true || member.estVip,
        montantCentimes: Number(body.montantCentimes) || undefined,
        enregistreParId: session.adminId,
      });
    }

    const mode = body.mode as PresenceMode | undefined;
    const isException = body.isException === true || mode != null;

    const presence = await createPresence({
      memberId,
      coachId,
      seanceClubId,
      enregistreParId: session.adminId,
      mode,
      isException,
      motifOffert: body.motifOffert as MotifOffert | undefined,
      motifAutre: body.motifAutre,
      notes: body.notes,
    });

    return NextResponse.json(
      {
        id: presence.id,
        mode: presence.mode,
        montantCentimes: presence.montantCentimes,
        member: presence.member,
        carteVendue: carteVendue
          ? {
              label: carteVendue.label,
              montantCentimes: carteVendue.montantCentimes,
              seancesRestantes: carteVendue.carte.seancesRestantes,
              message: `${carteVendue.label} vendue — ${formatMontant(carteVendue.montantCentimes)} · ${carteVendue.carte.seancesRestantes} séances`,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[POST /api/club/presences]", e);
    const msg = e instanceof Error ? e.message : "Erreur lors de l'enregistrement";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
