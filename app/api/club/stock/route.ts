import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canEditStock } from "@/lib/club-access";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const items = await prisma.stockItem.findMany({
    orderBy: [{ categorie: "asc" }, { nom: "asc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canEditStock(session)) {
    return NextResponse.json({ error: "Réservé à Chris / Sarah" }, { status: 403 });
  }

  const body = await req.json();
  const nom = typeof body.nom === "string" ? body.nom.trim() : "";

  if (!nom) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }

  const item = await prisma.stockItem.create({
    data: {
      nom,
      categorie: body.categorie?.trim() || "Général",
      quantite: Number(body.quantite) || 0,
      seuilAlerte: Number(body.seuilAlerte) || 5,
      unite: body.unite?.trim() || "unité",
    },
  });

  await auditMutation(req, {
    action: "CREATE",
    entity: "stock",
    entityId: item.id,
    details: nom,
  });

  return NextResponse.json(item, { status: 201 });
}
