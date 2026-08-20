import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import {
  canAccessClub,
  canViewScore,
  getCoachFilterId,
} from "@/lib/club-access";
import {
  compareBilans,
  daysSince,
  needsBilanReminder,
} from "@/lib/club/bilans";
import { getMemberActivity } from "@/lib/club/stats";
import { getTarifsMap, resolveDefaultPayment } from "@/lib/club/tarifs";
import { SCORE_LABELS } from "@/lib/club/score";
import { vendreCarte, getActiveCarte } from "@/lib/club/cartes";
import { formatMontant } from "@/lib/club/tarifs";
import {
  CARTE_PRIX_CLASSIQUE_CENTIMES,
  CARTE_PRIX_VIP_CENTIMES,
} from "@/lib/club/cartes-config";

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
  const memberId = Number(id);
  const coachFilter = getCoachFilterId(session);

  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
    include: {
      coachReferent: { select: { id: true, prenom: true, nom: true } },
      bilans: { orderBy: { date: "desc" } },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (coachFilter != null && member.coachReferentId !== coachFilter) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const [activite, tarifs, carteActive] = await Promise.all([
    getMemberActivity(memberId),
    getTarifsMap(),
    getActiveCarte(memberId),
  ]);

  const dernierBilan = member.bilans[0] ?? null;
  const bilanPrecedent = member.bilans[1] ?? null;
  const comparaison =
    dernierBilan && bilanPrecedent
      ? compareBilans(bilanPrecedent, dernierBilan)
      : null;

  const showScore = session
    ? canViewScore(session, member.coachReferentId)
    : false;

  return NextResponse.json({
    ...member,
    paymentPreview: resolveDefaultPayment(member, tarifs),
    carteActive,
    prixCarteClassique: CARTE_PRIX_CLASSIQUE_CENTIMES,
    prixCarteVip: CARTE_PRIX_VIP_CENTIMES,
    activite,
    comparaison,
    rappelBilan: {
      actif: needsBilanReminder(dernierBilan?.date ?? null),
      joursDepuis: dernierBilan ? daysSince(dernierBilan.date) : null,
    },
    score:
      showScore && member.scoreProgression
        ? SCORE_LABELS[member.scoreProgression]
        : null,
    dernierBilan,
  });
}

async function canAccessMember(
  session: Awaited<ReturnType<typeof getSessionFromRequest>>,
  id: number
) {
  const membre = await prisma.clubMember.findUnique({ where: { id } });
  if (!membre) return null;
  const coachFilter = getCoachFilterId(session);
  if (coachFilter != null && membre.coachReferentId !== coachFilter) return false;
  return membre;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const memberId = Number(id);
  const access = await canAccessMember(session, memberId);
  if (access === null) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (access === false) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  if (body.action === "vendreCarte") {
    try {
      const result = await vendreCarte({
        memberId,
        estVip:
          typeof body.estVip === "boolean" ? body.estVip : access.estVip,
        montantCentimes: Number(body.montantCentimes) || undefined,
        enregistreParId: session?.adminId,
      });
      return NextResponse.json({
        success: true,
        message: `${result.label} vendue — ${formatMontant(result.montantCentimes)} encaissés. ${result.carte.seancesRestantes} séances · coût futur ${formatMontant(result.coutFitReserveCentimes)} · bénéfice potentiel ${formatMontant(result.beneficePotentielCentimes)}`,
        ...result,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};

  if (typeof body.prenom === "string" && body.prenom.trim()) {
    data.prenom = body.prenom.trim();
  }
  if (typeof body.nom === "string") data.nom = body.nom.trim() || null;
  if (typeof body.telephone === "string") data.telephone = body.telephone.trim() || null;
  if (typeof body.email === "string") data.email = body.email.trim() || null;
  if (typeof body.facebook === "string") data.facebook = body.facebook.trim() || null;
  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;
  if (typeof body.objectif === "string") data.objectif = body.objectif.trim() || null;
  if (typeof body.transformation === "string") {
    data.transformation = body.transformation.trim() || null;
  }
  if (typeof body.estClient === "boolean") data.estClient = body.estClient;
  if (typeof body.actif === "boolean") data.actif = body.actif;
  if (typeof body.estVip === "boolean") data.estVip = body.estVip;
  if (typeof body.aNutrition === "boolean") data.aNutrition = body.aNutrition;
  if (typeof body.photoAvant === "string") data.photoAvant = body.photoAvant.trim() || null;
  if (typeof body.photoApres === "string") data.photoApres = body.photoApres.trim() || null;
  if (typeof body.nutritionProgramme === "string") {
    data.nutritionProgramme = body.nutritionProgramme.trim() || null;
  }
  if (typeof body.nutritionProduits === "string") {
    data.nutritionProduits = body.nutritionProduits.trim() || null;
  }
  if (typeof body.nutritionNotes === "string") {
    data.nutritionNotes = body.nutritionNotes.trim() || null;
  }
  if (body.abonnementType === "SEANCE" || body.abonnementType === "VIP" || body.abonnementType === "CARTE_10") {
    data.abonnementType = body.abonnementType;
    if (body.abonnementType === "VIP") data.estVip = true;
  }
  if (Number.isInteger(body.seancesCarteRestantes)) {
    data.seancesCarteRestantes = body.seancesCarteRestantes;
  }

  if (getCoachFilterId(session) == null && Number(body.coachReferentId) > 0) {
    data.coachReferentId = Number(body.coachReferentId);
  }

  const updated = await prisma.clubMember.update({
    where: { id: memberId },
    data,
    include: {
      coachReferent: { select: { id: true, prenom: true, nom: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const memberId = Number(id);
  const access = await canAccessMember(session, memberId);
  if (access === null) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  if (access === false) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.clubMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
