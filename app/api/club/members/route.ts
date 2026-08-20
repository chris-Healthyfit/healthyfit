import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CARTE_SEANCES_TOTAL } from "@/lib/club/cartes-config";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, getCoachFilterId } from "@/lib/club-access";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const coachFilter = getCoachFilterId(session);
  const where = coachFilter != null ? { coachReferentId: coachFilter } : {};

  const membres = await prisma.clubMember.findMany({
    where,
    orderBy: [{ estClient: "desc" }, { prenom: "asc" }],
    include: {
      coachReferent: { select: { id: true, prenom: true, nom: true } },
    },
  });

  return NextResponse.json(membres);
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const prenom = typeof body.prenom === "string" ? body.prenom.trim() : "";
  const nom = typeof body.nom === "string" ? body.nom.trim() : null;
  const estClient = body.estClient !== false;
  let coachReferentId = Number(body.coachReferentId);

  const coachFilter = getCoachFilterId(session);
  if (coachFilter != null) coachReferentId = coachFilter;

  if (!prenom || !Number.isInteger(coachReferentId) || coachReferentId <= 0) {
    return NextResponse.json(
      { error: "Prénom et coach référent requis." },
      { status: 400 }
    );
  }

  const abonnementType =
    body.abonnementType === "VIP" ||
    body.abonnementType === "CARTE_10" ||
    body.abonnementType === "SEANCE"
      ? body.abonnementType
      : body.estVip === true
        ? "VIP"
        : "SEANCE";

  const membre = await prisma.clubMember.create({
    data: {
      prenom,
      nom,
      telephone: body.telephone?.trim() || null,
      email: body.email?.trim() || null,
      facebook: body.facebook?.trim() || null,
      objectif: body.objectif?.trim() || null,
      estClient,
      actif: body.actif !== false,
      estVip: abonnementType === "VIP",
      aNutrition: body.aNutrition === true,
      abonnementType,
      seancesCarteRestantes:
        abonnementType === "CARTE_10"
          ? Number(body.seancesCarteRestantes) || CARTE_SEANCES_TOTAL
          : null,
      coachReferentId,
      notes: body.notes?.trim() || null,
    },
    include: {
      coachReferent: { select: { id: true, prenom: true, nom: true } },
    },
  });

  await auditMutation(req, {
    action: "CREATE",
    entity: "club_member",
    entityId: membre.id,
    details: `${prenom} (${estClient ? "client" : "non-client"})`,
  });

  return NextResponse.json(membre, { status: 201 });
}
