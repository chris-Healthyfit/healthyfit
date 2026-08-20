import type { AbonnementType, ClubMember, ClubTarif, PresenceMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import {
  CARTE_PRIX_CLASSIQUE_CENTIMES,
  CARTE_PRIX_VIP_CENTIMES,
  CARTE_SEANCES_TOTAL,
  CARTE_TARIF_CODES,
} from "@/lib/club/cartes-config";

export const TARIF_CODES = {
  SEANCE: "SEANCE",
  VIP: "VIP",
  CARTE_10: "CARTE_10",
  CARTE_CLASSIQUE: "CARTE_CLASSIQUE",
  CARTE_VIP: "CARTE_VIP",
} as const;

export const DEFAULT_TARIFS = [
  { code: "SEANCE", label: "Séance classique", montantCentimes: 800, ordre: 1, categorie: "SPORT" as const },
  { code: "VIP", label: "Séance VIP", montantCentimes: 600, ordre: 2, categorie: "SPORT" as const },
  {
    code: "CARTE_CLASSIQUE",
    label: "Carte 10 séances classique",
    montantCentimes: CARTE_PRIX_CLASSIQUE_CENTIMES,
    seancesIncluses: CARTE_SEANCES_TOTAL,
    ordre: 3,
    categorie: "SPORT" as const,
  },
  {
    code: "CARTE_VIP",
    label: "Carte 10 séances VIP",
    montantCentimes: CARTE_PRIX_VIP_CENTIMES,
    seancesIncluses: CARTE_SEANCES_TOTAL,
    ordre: 4,
    categorie: "SPORT" as const,
  },
  { code: "BILAN", label: "Bilan complet", montantCentimes: 0, ordre: 5, categorie: "BILAN" as const },
  { code: "NUTRITION_PROG", label: "Programme nutrition", montantCentimes: 8900, ordre: 6, categorie: "NUTRITION" as const },
  { code: "SKIN_PRODUIT", label: "Produit Skin", montantCentimes: 4500, ordre: 7, categorie: "SKIN" as const },
] as const;

export async function ensureDefaultTarifs() {
  for (const t of DEFAULT_TARIFS) {
    await prisma.clubTarif.upsert({
      where: { code: t.code },
      create: {
        code: t.code,
        label: t.label,
        montantCentimes: t.montantCentimes,
        seancesIncluses: "seancesIncluses" in t ? t.seancesIncluses : null,
        categorie: t.categorie,
        ordre: t.ordre,
      },
      update: { categorie: t.categorie },
    });
  }
}

export async function getTarifsMap() {
  await ensureDefaultTarifs();
  const tarifs = await prisma.clubTarif.findMany({
    where: { actif: true },
    orderBy: { ordre: "asc" },
  });
  return Object.fromEntries(tarifs.map((t) => [t.code, t])) as Record<
    string,
    ClubTarif
  >;
}

export function formatMontant(centimes: number) {
  return `${(centimes / 100).toFixed(centimes % 100 === 0 ? 0 : 2).replace(".", ",")} €`;
}

export type PaymentPreview = {
  mode: PresenceMode;
  label: string;
  montantCentimes: number;
  montantLabel: string;
  tarifCode: string | null;
  carteRestantes: number | null;
  useCarte: boolean;
};

export function resolveDefaultPayment(
  member: Pick<
    ClubMember,
    "abonnementType" | "estVip" | "seancesCarteRestantes"
  >,
  tarifs: Record<string, ClubTarif>
): PaymentPreview {
  if (
    member.abonnementType === "CARTE_10" &&
    member.seancesCarteRestantes != null &&
    member.seancesCarteRestantes > 0
  ) {
    return {
      mode: "CARTE_10",
      label: "Carte 10",
      montantCentimes: 0,
      montantLabel: `Carte — ${member.seancesCarteRestantes} séance${member.seancesCarteRestantes > 1 ? "s" : ""} restante${member.seancesCarteRestantes > 1 ? "s" : ""}`,
      tarifCode: TARIF_CODES.CARTE_10,
      carteRestantes: member.seancesCarteRestantes,
      useCarte: true,
    };
  }

  if (member.abonnementType === "VIP" || member.estVip) {
    const tarif = tarifs[TARIF_CODES.VIP];
    const montant = tarif?.montantCentimes ?? 600;
    return {
      mode: "VIP",
      label: "VIP",
      montantCentimes: montant,
      montantLabel: formatMontant(montant),
      tarifCode: TARIF_CODES.VIP,
      carteRestantes: null,
      useCarte: false,
    };
  }

  const tarif = tarifs[TARIF_CODES.SEANCE];
  const montant = tarif?.montantCentimes ?? 800;
  return {
    mode: "SEANCE",
    label: "Séance",
    montantCentimes: montant,
    montantLabel: formatMontant(montant),
    tarifCode: TARIF_CODES.SEANCE,
    carteRestantes: member.seancesCarteRestantes,
    useCarte: false,
  };
}

export function resolveExceptionPayment(
  mode: PresenceMode,
  tarifs: Record<string, ClubTarif>
): PaymentPreview {
  if (mode === "OFFERTE") {
    return {
      mode: "OFFERTE",
      label: "Séance offerte",
      montantCentimes: 0,
      montantLabel: "Offerte",
      tarifCode: null,
      carteRestantes: null,
      useCarte: false,
    };
  }

  if (mode === "VIP") {
    const montant = tarifs[TARIF_CODES.VIP]?.montantCentimes ?? 600;
    return {
      mode: "VIP",
      label: "VIP",
      montantCentimes: montant,
      montantLabel: formatMontant(montant),
      tarifCode: TARIF_CODES.VIP,
      carteRestantes: null,
      useCarte: false,
    };
  }

  if (mode === "CARTE_10") {
    return {
      mode: "CARTE_10",
      label: "Carte 10",
      montantCentimes: 0,
      montantLabel: "Carte utilisée",
      tarifCode: TARIF_CODES.CARTE_10,
      carteRestantes: null,
      useCarte: true,
    };
  }

  const montant = tarifs[TARIF_CODES.SEANCE]?.montantCentimes ?? 800;
  return {
    mode: "SEANCE",
    label: "Séance",
    montantCentimes: montant,
    montantLabel: formatMontant(montant),
    tarifCode: TARIF_CODES.SEANCE,
    carteRestantes: null,
    useCarte: false,
  };
}

export function abonnementFromType(type: AbonnementType) {
  switch (type) {
    case "VIP":
      return { estVip: true, abonnementType: type };
    case "CARTE_10":
      return { estVip: false, abonnementType: type };
    default:
      return { estVip: false, abonnementType: type };
  }
}
