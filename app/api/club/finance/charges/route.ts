import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { nextEcheance } from "@/lib/finance/charges";
import type { ChargeFrequence } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const charges = await prisma.charge.findMany({
    orderBy: { prochaineEcheance: "asc" },
  });

  return NextResponse.json(charges);
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const montant = Math.round(Number(body.montantCentimes) || Number(body.montant) * 100);
  if (!body.nom?.trim() || montant <= 0) {
    return NextResponse.json({ error: "Nom et montant requis" }, { status: 400 });
  }

  const frequence = (body.frequence ?? "MENSUELLE") as ChargeFrequence;
  const prochaineEcheance = body.prochaineEcheance
    ? new Date(body.prochaineEcheance)
    : nextEcheance(new Date(), frequence);

  const charge = await prisma.charge.create({
    data: {
      nom: body.nom.trim(),
      categorie: body.categorie?.trim() || "Général",
      montantCentimes: montant,
      frequence,
      prochaineEcheance,
    },
  });

  return NextResponse.json(charge, { status: 201 });
}
