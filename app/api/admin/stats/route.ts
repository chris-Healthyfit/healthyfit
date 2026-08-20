import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const [
    coachs,
    seances,
    reservations,
    newReservations,
    temoignages,
    galerie,
  ] = await Promise.all([
    prisma.coach.count(),
    prisma.seance.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { statut: "NEW" } }),
    prisma.temoignage.count({ where: { actif: true } }),
    prisma.galerie.count({ where: { actif: true } }),
  ]);

  return NextResponse.json({
    coachs,
    seances,
    reservations,
    newReservations,
    temoignages,
    galerie,
  });
}
