import type { EntryType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LedgerInput = {
  date?: Date;
  type: EntryType;
  categorie: string;
  libelle: string;
  recetteCentimes?: number;
  depenseCentimes?: number;
  coutCentimes?: number;
  beneficeCentimes?: number;
  referenceType?: string;
  referenceId?: number;
};

export async function addLedgerEntry(
  input: LedgerInput,
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;
  const recette = input.recetteCentimes ?? 0;
  const depense = input.depenseCentimes ?? 0;
  const cout = input.coutCentimes ?? 0;
  const benefice =
    input.beneficeCentimes ??
    (recette > 0 ? recette - cout - depense : -(cout + depense));

  return db.accountingEntry.create({
    data: {
      date: input.date ?? new Date(),
      type: input.type,
      categorie: input.categorie,
      libelle: input.libelle,
      recetteCentimes: recette,
      depenseCentimes: depense,
      coutCentimes: cout,
      beneficeCentimes: benefice,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
    },
  });
}

export async function recordPresenceFinance(
  presence: {
    id: number;
    date: Date;
    montantCentimes: number;
    mode: string;
    member: { prenom: string; nom: string | null };
  },
  coutFitCentimes: number,
  tx?: Prisma.TransactionClient
) {
  const db = tx ?? prisma;
  const benefice = presence.montantCentimes - coutFitCentimes;
  const label = `Présence ${presence.member.prenom}${presence.member.nom ? ` ${presence.member.nom}` : ""}`;

  await addLedgerEntry(
    {
      date: presence.date,
      type: "PRESENCE_RECETTE",
      categorie: "SPORT",
      libelle: label,
      recetteCentimes: presence.montantCentimes,
      coutCentimes: coutFitCentimes,
      beneficeCentimes: benefice,
      referenceType: "presence",
      referenceId: presence.id,
    },
    db
  );

  if (coutFitCentimes > 0) {
    await addLedgerEntry(
      {
        date: presence.date,
        type: "PRESENCE_COUT_FIT",
        categorie: "SPORT",
        libelle: `Coût FIT — ${label}`,
        coutCentimes: coutFitCentimes,
        depenseCentimes: coutFitCentimes,
        beneficeCentimes: -coutFitCentimes,
        referenceType: "presence",
        referenceId: presence.id,
      },
      db
    );
  }

  return benefice;
}

export async function recordBilanFinance(
  bilan: { id: number; date: Date; member: { prenom: string } },
  coutCentimes: number,
  tx?: Prisma.TransactionClient
) {
  return addLedgerEntry(
    {
      date: bilan.date,
      type: "BILAN_COUT",
      categorie: "BILAN",
      libelle: `Bilan — ${bilan.member.prenom}`,
      depenseCentimes: coutCentimes,
      coutCentimes,
      beneficeCentimes: -coutCentimes,
      referenceType: "bilan",
      referenceId: bilan.id,
    },
    tx
  );
}

export async function recordPurchaseFinance(
  purchase: { id: number; date: Date; totalCentimes: number; notes: string | null },
  tx?: Prisma.TransactionClient
) {
  return addLedgerEntry(
    {
      date: purchase.date,
      type: "ACHAT",
      categorie: "ACHAT",
      libelle: purchase.notes ?? `Achat #${purchase.id}`,
      depenseCentimes: purchase.totalCentimes,
      beneficeCentimes: -purchase.totalCentimes,
      referenceType: "purchase",
      referenceId: purchase.id,
    },
    tx
  );
}

export async function recordChargePayment(
  charge: { id: number; nom: string; montantCentimes: number },
  date = new Date(),
  tx?: Prisma.TransactionClient
) {
  return addLedgerEntry(
    {
      date,
      type: "CHARGE",
      categorie: charge.nom,
      libelle: `Paiement — ${charge.nom}`,
      depenseCentimes: charge.montantCentimes,
      beneficeCentimes: -charge.montantCentimes,
      referenceType: "charge",
      referenceId: charge.id,
    },
    tx
  );
}

export async function recordVenteFinance(
  vente: {
    id: number;
    date: Date;
    type: "NUTRITION" | "SKIN";
    libelle: string;
    montantCentimes: number;
  },
  tx?: Prisma.TransactionClient
) {
  return addLedgerEntry(
    {
      date: vente.date,
      type: vente.type === "NUTRITION" ? "VENTE_NUTRITION" : "VENTE_SKIN",
      categorie: vente.type,
      libelle: vente.libelle,
      recetteCentimes: vente.montantCentimes,
      beneficeCentimes: vente.montantCentimes,
      referenceType: "vente",
      referenceId: vente.id,
    },
    tx
  );
}
