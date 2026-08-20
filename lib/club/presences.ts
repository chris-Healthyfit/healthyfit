import type { MotifOffert, PresenceMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getTarifsMap,
  resolveDefaultPayment,
  resolveExceptionPayment,
} from "@/lib/club/tarifs";

export type CreatePresenceInput = {
  memberId: number;
  coachId: number;
  enregistreParId: number;
  seanceClubId?: number;
  mode?: PresenceMode;
  isException?: boolean;
  motifOffert?: MotifOffert;
  motifAutre?: string;
  notes?: string;
};

export async function createPresence(input: CreatePresenceInput) {
  const member = await prisma.clubMember.findUnique({
    where: { id: input.memberId },
  });
  if (!member) throw new Error("Client introuvable");

  const tarifs = await getTarifsMap();
  const payment =
    input.isException && input.mode
      ? resolveExceptionPayment(input.mode, tarifs)
      : resolveDefaultPayment(member, tarifs);

  if (payment.mode === "OFFERTE" && !input.motifOffert) {
    throw new Error("Motif obligatoire pour une séance offerte");
  }

  if (!input.seanceClubId) {
    throw new Error("Séance collective requise");
  }

  const seanceClub = await prisma.seanceClub.findUnique({
    where: { id: input.seanceClubId },
  });
  if (!seanceClub) throw new Error("Séance introuvable");

  return prisma.$transaction(async (tx) => {
    const created = await tx.presence.create({
      data: {
        memberId: input.memberId,
        coachId: input.coachId,
        seanceClubId: input.seanceClubId,
        enregistreParId: input.enregistreParId,
        mode: payment.mode,
        montantCentimes: payment.montantCentimes,
        tarifCode: payment.tarifCode,
        isException: input.isException ?? false,
        motifOffert: payment.mode === "OFFERTE" ? input.motifOffert : null,
        motifAutre: input.motifAutre?.trim() || null,
        notes: input.notes?.trim() || null,
      },
      include: {
        member: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            seancesCarteRestantes: true,
          },
        },
        coach: { select: { id: true, prenom: true, nom: true } },
      },
    });

    if (payment.useCarte) {
      const fresh = await tx.clubMember.findUnique({
        where: { id: member.id },
        select: { seancesCarteRestantes: true },
      });
      if (!fresh?.seancesCarteRestantes || fresh.seancesCarteRestantes <= 0) {
        throw new Error("Carte épuisée — vendez une nouvelle carte au client.");
      }
    }

    const { applyPresenceFinance } = await import("@/lib/finance/stock");
    await applyPresenceFinance(created.id, tx);

    return created;
  });
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1);
}
