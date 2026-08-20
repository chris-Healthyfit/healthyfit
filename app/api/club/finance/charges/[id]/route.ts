import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { recordChargePayment } from "@/lib/finance/ledger";
import { nextEcheance } from "@/lib/finance/charges";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const charge = await prisma.charge.findUnique({
    where: { id: Number(id) },
  });
  if (!charge) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await recordChargePayment(charge, new Date(), tx);
    await tx.charge.update({
      where: { id: charge.id },
      data: {
        prochaineEcheance: nextEcheance(charge.prochaineEcheance, charge.frequence),
      },
    });
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.nom === "string") data.nom = body.nom.trim();
  if (typeof body.categorie === "string") data.categorie = body.categorie.trim();
  if (Number.isInteger(body.montantCentimes)) data.montantCentimes = body.montantCentimes;
  if (body.frequence) data.frequence = body.frequence;
  if (body.prochaineEcheance) data.prochaineEcheance = new Date(body.prochaineEcheance);
  if (typeof body.actif === "boolean") data.actif = body.actif;

  const updated = await prisma.charge.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.charge.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
