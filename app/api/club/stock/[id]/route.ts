import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canEditStock } from "@/lib/club-access";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canEditStock(session)) {
    return NextResponse.json({ error: "Réservé à Chris / Sarah" }, { status: 403 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "Article invalide" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.nom === "string" && body.nom.trim()) data.nom = body.nom.trim();
    if (typeof body.categorie === "string") data.categorie = body.categorie.trim();
    if (typeof body.quantite === "number") data.quantite = body.quantite;
    if (typeof body.seuilAlerte === "number") data.seuilAlerte = body.seuilAlerte;
    if (typeof body.unite === "string") data.unite = body.unite.trim();

    const updated = await prisma.stockItem.update({
      where: { id: itemId },
      data,
    });

    await auditMutation(req, {
      action: "UPDATE",
      entity: "stock",
      entityId: updated.id,
      details: updated.nom,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("[PATCH /api/club/stock/:id]", e);
    const msg = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!canEditStock(session)) {
    return NextResponse.json({ error: "Réservé à Chris / Sarah" }, { status: 403 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "Article invalide" }, { status: 400 });
  }

  try {
    const existing = await prisma.stockItem.findUnique({ where: { id: itemId } });
    if (!existing) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    const item = await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({ where: { stockItemId: itemId } });
      await tx.fitCostItem.updateMany({
        where: { stockItemId: itemId },
        data: { stockItemId: null },
      });
      await tx.stockPurchaseLine.updateMany({
        where: { stockItemId: itemId },
        data: { stockItemId: null },
      });
      return tx.stockItem.delete({ where: { id: itemId } });
    });

    await auditMutation(req, {
      action: "DELETE",
      entity: "stock",
      entityId: item.id,
      details: item.nom,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/club/stock/:id]", e);
    const msg = e instanceof Error ? e.message : "Impossible de supprimer cet article";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
