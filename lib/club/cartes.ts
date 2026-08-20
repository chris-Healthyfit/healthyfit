import type { CarteType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeFitCostCentimes } from "@/lib/finance/fit-cost";
import {
  CARTE_SEANCES_TOTAL,
  labelCarte,
  prixCarteCentimes,
} from "@/lib/club/cartes-config";
import {
  recordCarteConsommationFinance,
  recordCarteVenteFinance,
} from "@/lib/finance/cartes";

export type VendreCarteInput = {
  memberId: number;
  estVip?: boolean;
  montantCentimes?: number;
  enregistreParId?: number;
};

export async function getActiveCarte(memberId: number) {
  return prisma.carteClub.findFirst({
    where: { memberId, actif: true, seancesRestantes: { gt: 0 } },
    orderBy: { dateVente: "desc" },
  });
}

export async function vendreCarte(input: VendreCarteInput) {
  const member = await prisma.clubMember.findUnique({
    where: { id: input.memberId },
  });
  if (!member) throw new Error("Client introuvable");

  const estVip = input.estVip ?? member.estVip;
  const type: CarteType = estVip ? "VIP" : "CLASSIQUE";
  const montant = prixCarteCentimes(estVip, input.montantCentimes);
  const fitUnit = await computeFitCostCentimes();
  const reserveTotal = fitUnit * CARTE_SEANCES_TOTAL;
  const beneficePotentiel = montant - reserveTotal;

  return prisma.$transaction(async (tx) => {
    await tx.carteClub.updateMany({
      where: { memberId: member.id, actif: true },
      data: { actif: false, seancesRestantes: 0 },
    });

    const carte = await tx.carteClub.create({
      data: {
        memberId: member.id,
        type,
        seancesTotal: CARTE_SEANCES_TOTAL,
        seancesRestantes: CARTE_SEANCES_TOTAL,
        montantVenteCentimes: montant,
        coutFitUnitaireCentimes: fitUnit,
        coutFitReserveCentimes: reserveTotal,
        actif: true,
      },
    });

    await tx.clubMember.update({
      where: { id: member.id },
      data: {
        abonnementType: "CARTE_10",
        estVip: estVip,
        seancesCarteRestantes: CARTE_SEANCES_TOTAL,
      },
    });

    await recordCarteVenteFinance(
      {
        carteId: carte.id,
        member: { prenom: member.prenom, nom: member.nom },
        type,
        montantCentimes: montant,
        coutFitReserveCentimes: reserveTotal,
        beneficePotentielCentimes: beneficePotentiel,
        fitUnitaireCentimes: fitUnit,
      },
      tx
    );

    return {
      carte,
      montantCentimes: montant,
      coutFitReserveCentimes: reserveTotal,
      beneficePotentielCentimes: beneficePotentiel,
      label: labelCarte(type),
    };
  });
}

export async function consommerSeanceCarte(
  memberId: number,
  presenceId: number,
  tx: Prisma.TransactionClient
) {
  const carte = await tx.carteClub.findFirst({
    where: { memberId, actif: true, seancesRestantes: { gt: 0 } },
    orderBy: { dateVente: "desc" },
  });
  if (!carte) return null;

  const fitUnit = carte.coutFitUnitaireCentimes;
  const restantes = carte.seancesRestantes - 1;
  const reserveRestante = restantes * fitUnit;

  await tx.carteClub.update({
    where: { id: carte.id },
    data: {
      seancesRestantes: restantes,
      coutFitReserveCentimes: reserveRestante,
      actif: restantes > 0,
    },
  });

  await tx.clubMember.update({
    where: { id: memberId },
    data: {
      seancesCarteRestantes: restantes,
      ...(restantes === 0
        ? { abonnementType: "SEANCE" as const, seancesCarteRestantes: 0 }
        : {}),
    },
  });

  const member = await tx.clubMember.findUnique({
    where: { id: memberId },
    select: { prenom: true, nom: true },
  });

  if (member) {
    await recordCarteConsommationFinance(
      {
        carteId: carte.id,
        presenceId,
        member,
        fitUnitaireCentimes: fitUnit,
        seancesRestantes: restantes,
      },
      tx
    );
  }

  return { seancesRestantes: restantes, carteId: carte.id };
}

export async function getCartesReserveStats() {
  const actives = await prisma.carteClub.findMany({
    where: { actif: true, seancesRestantes: { gt: 0 } },
  });

  return {
    cartesActives: actives.length,
    seancesRestantes: actives.reduce((s, c) => s + c.seancesRestantes, 0),
    coutFuturCentimes: actives.reduce(
      (s, c) => s + c.seancesRestantes * c.coutFitUnitaireCentimes,
      0
    ),
  };
}
