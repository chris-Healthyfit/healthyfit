import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canViewFinances } from "@/lib/club-access";
import { recordPurchaseFinance } from "@/lib/finance/ledger";
import { updateStockPortionCost } from "@/lib/finance/stock";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const achats = await prisma.stockPurchase.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: {
      lines: { include: { stockItem: { select: { nom: true } } } },
    },
  });

  return NextResponse.json(achats);
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canViewFinances(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (lines.length === 0) {
    return NextResponse.json({ error: "Lignes requises" }, { status: 400 });
  }

  const purchase = await prisma.$transaction(async (tx) => {
    let total = 0;
    const parsed: {
      stockItemId: number;
      quantite: number;
      prixUnitaireCentimes: number;
    }[] = lines.map(
      (l: { stockItemId: number; quantite: number; prixUnitaireCentimes: number }) => {
        total += l.quantite * l.prixUnitaireCentimes;
        return l;
      }
    );

    const created = await tx.stockPurchase.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        totalCentimes: total,
        notes: body.notes?.trim() || null,
        lines: {
          create: parsed.map((l) => ({
            stockItemId: Number(l.stockItemId),
            quantite: Number(l.quantite),
            prixUnitaireCentimes: Number(l.prixUnitaireCentimes),
          })),
        },
      },
      include: { lines: true },
    });

    for (const line of created.lines) {
      if (line.stockItemId == null) continue;
      const stockItemId = line.stockItemId;
      await tx.stockItem.update({
        where: { id: stockItemId },
        data: {
          quantite: { increment: line.quantite },
          prixAchatCentimes: line.prixUnitaireCentimes,
        },
      });
      await tx.stockMovement.create({
        data: {
          stockItemId,
          delta: line.quantite,
          libelle: `Achat #${created.id}`,
        },
      });
    }

    await recordPurchaseFinance(created, tx);
    return created;
  });

  for (const line of purchase.lines) {
    if (line.stockItemId != null) {
      await updateStockPortionCost(line.stockItemId);
    }
  }

  return NextResponse.json(purchase, { status: 201 });
}
