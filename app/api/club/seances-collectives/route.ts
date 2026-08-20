import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canViewFinances, getCoachFilterId } from "@/lib/club-access";
import {
  findOrCreateSeanceClub,
  listCatalogSeancesForDay,
} from "@/lib/club/seances-collectives";
import { startOfDay } from "@/lib/club/presences";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const day = dateParam ? new Date(dateParam) : new Date();
  const coachFilter = getCoachFilterId(session);
  const showAll = searchParams.get("all") === "1";

  const seances = await listCatalogSeancesForDay(day, coachFilter, {
    all: showAll,
  });
  const showFinances = canViewFinances(session);

  return NextResponse.json(
    seances.map((s) => ({
      seanceId: s.seanceId,
      horaire: s.horaire,
      titre: s.titre,
      niveau: s.niveau,
      id: s.seanceClubId,
      seanceClubId: s.seanceClubId,
      coach: s.coach,
      presences: s.stats.presences,
      recetteCentimes: showFinances ? s.stats.recetteCentimes : undefined,
      beneficeCentimes: showFinances ? s.stats.beneficeCentimes : undefined,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session) || !session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const seanceId = Number(body.seanceId);
  if (!Number.isInteger(seanceId) || seanceId <= 0) {
    return NextResponse.json({ error: "Séance requise" }, { status: 400 });
  }

  const coachId =
    session.role === "COACH" && session.coachId
      ? session.coachId
      : Number(body.coachId) || session.coachId;

  if (!coachId) {
    return NextResponse.json({ error: "Coach requis" }, { status: 400 });
  }

  const date = body.date ? startOfDay(new Date(body.date)) : startOfDay();

  try {
    const seance = await findOrCreateSeanceClub(date, seanceId, coachId);
    return NextResponse.json(seance, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
