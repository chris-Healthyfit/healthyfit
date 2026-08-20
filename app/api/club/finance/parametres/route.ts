import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { ensureDefaultTarifs } from "@/lib/club/tarifs";
import {
  ensureFitCostItems,
  getFitCostBreakdown,
  getFinanceConfig,
} from "@/lib/finance/fit-cost";
import { recordVenteFinance } from "@/lib/finance/ledger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await ensureDefaultTarifs();
  await ensureFitCostItems();

  const [tarifs, config, fitCost, stock] = await Promise.all([
    prisma.clubTarif.findMany({ orderBy: { ordre: "asc" } }),
    getFinanceConfig(),
    getFitCostBreakdown(),
    prisma.stockItem.findMany({ orderBy: { nom: "asc" } }),
  ]);

  const fitItems = await prisma.fitCostItem.findMany({
    orderBy: { ordre: "asc" },
    include: { stockItem: { select: { id: true, nom: true } } },
  });

  return NextResponse.json({ tarifs, config, fitCost, fitItems, stock });
}

export async function PATCH(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  if (Number.isInteger(body.coutBilanCentimes)) {
    await prisma.financeConfig.upsert({
      where: { id: 1 },
      create: { id: 1, coutBilanCentimes: body.coutBilanCentimes },
      update: { coutBilanCentimes: body.coutBilanCentimes },
    });
  }

  if (body.tarif?.id && Number.isInteger(body.tarif.montantCentimes)) {
    await prisma.clubTarif.update({
      where: { id: body.tarif.id },
      data: {
        montantCentimes: body.tarif.montantCentimes,
        label: body.tarif.label,
      },
    });
  }

  if (body.fitItem?.id) {
    await prisma.fitCostItem.update({
      where: { id: body.fitItem.id },
      data: {
        coutPortionCentimes: body.fitItem.coutPortionCentimes,
        portionsParSeance: body.fitItem.portionsParSeance,
        stockItemId: body.fitItem.stockItemId ?? null,
      },
    });
  }

  if (body.stockItem?.id) {
    const s = body.stockItem;
    await prisma.stockItem.update({
      where: { id: s.id },
      data: {
        prixAchatCentimes: s.prixAchatCentimes,
        nombrePortions: s.nombrePortions,
        seuilAlerte: s.seuilAlerte,
        deduitParPresence: s.deduitParPresence,
        coutPortionCentimes:
          s.nombrePortions > 0
            ? Math.round(s.prixAchatCentimes / s.nombrePortions)
            : 0,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  if (body.action === "vente") {
    const vente = await prisma.vente.create({
      data: {
        type: body.type === "SKIN" ? "SKIN" : "NUTRITION",
        libelle: body.libelle?.trim() || "Vente",
        montantCentimes: Math.round(Number(body.montantCentimes) || 0),
        memberId: body.memberId ? Number(body.memberId) : null,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    await recordVenteFinance(vente);
    return NextResponse.json(vente, { status: 201 });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
