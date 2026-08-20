import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";
import { canAccessClub, canManageTarifs } from "@/lib/club-access";
import { ensureDefaultTarifs } from "@/lib/club/tarifs";
import { auditMutation } from "@/lib/api-audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canAccessClub(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await ensureDefaultTarifs();
  const tarifs = await prisma.clubTarif.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
    select: {
      id: true,
      code: true,
      label: true,
      montantCentimes: true,
      seancesIncluses: true,
      categorie: true,
      ordre: true,
      actif: true,
    },
  });

  return NextResponse.json(tarifs);
}

export async function PATCH(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!canManageTarifs(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const id = Number(body.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.label === "string" && body.label.trim()) {
    data.label = body.label.trim();
  }
  if (Number.isInteger(body.montantCentimes) && body.montantCentimes >= 0) {
    data.montantCentimes = body.montantCentimes;
  }
  if (body.seancesIncluses === null || Number.isInteger(body.seancesIncluses)) {
    data.seancesIncluses = body.seancesIncluses;
  }
  if (typeof body.actif === "boolean") data.actif = body.actif;

  const tarif = await prisma.clubTarif.update({
    where: { id },
    data,
  });

  await auditMutation(req, {
    action: "UPDATE",
    entity: "club_tarif",
    entityId: tarif.id,
    details: `${tarif.code} → ${tarif.montantCentimes / 100}€`,
  });

  return NextResponse.json(tarif);
}
