import { NextRequest, NextResponse } from "next/server";
import { ReservationStatut } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

import { verifySessionToken } from "@/lib/admin-auth";
import { auditMutation } from "@/lib/api-audit";

async function isAuthenticated(req: NextRequest) {
  return !!(await verifySessionToken(req.cookies.get("admin")?.value));
}

const statutsValides: ReservationStatut[] = [
  "NEW",
  "CONTACTED",
  "APPOINTMENT_SET",
  "CLIENT",
  "CLOSED",
];

// GET — détail d'une réservation (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        seance: { select: { id: true, titre: true } },
        coach: { select: { id: true, prenom: true, nom: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Erreur lecture réservation :", error);
    return NextResponse.json(
      { error: "Impossible de charger la réservation." },
      { status: 500 }
    );
  }
}

// PATCH — mise à jour du statut (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reservationId = Number(id);
    const body = await req.json();

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    if (!body.statut || !statutsValides.includes(body.statut)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { statut: body.statut },
      include: {
        seance: { select: { id: true, titre: true } },
        coach: { select: { id: true, prenom: true, nom: true } },
      },
    });

    await auditMutation(req, {
      action: "UPDATE",
      entity: "reservation",
      entityId: reservation.id,
      details: `Statut → ${reservation.statut}`,
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Erreur mise à jour réservation :", error);
    return NextResponse.json(
      { error: "Impossible de mettre à jour la réservation." },
      { status: 500 }
    );
  }
}

// DELETE — suppression (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reservationId = Number(id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return NextResponse.json({ error: "ID invalide." }, { status: 400 });
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    await auditMutation(req, {
      action: "DELETE",
      entity: "reservation",
      entityId: reservationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression réservation :", error);
    return NextResponse.json(
      { error: "Impossible de supprimer la réservation." },
      { status: 500 }
    );
  }
}
