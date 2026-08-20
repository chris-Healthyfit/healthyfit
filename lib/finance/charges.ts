import type { ChargeFrequence } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MS_DAY = 86400000;

export function nextEcheance(
  from: Date,
  frequence: ChargeFrequence
): Date {
  const d = new Date(from);
  switch (frequence) {
    case "HEBDOMADAIRE":
      d.setDate(d.getDate() + 7);
      break;
    case "MENSUELLE":
      d.setMonth(d.getMonth() + 1);
      break;
    case "TRIMESTRIELLE":
      d.setMonth(d.getMonth() + 3);
      break;
    case "SEMESTRIELLE":
      d.setMonth(d.getMonth() + 6);
      break;
    case "ANNUELLE":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d;
}

export async function getUpcomingCharges(withinDays = 14) {
  const now = new Date();
  const limit = new Date(now.getTime() + withinDays * MS_DAY);

  const charges = await prisma.charge.findMany({
    where: { actif: true, prochaineEcheance: { lte: limit } },
    orderBy: { prochaineEcheance: "asc" },
  });

  return charges.map((c) => ({
    ...c,
    joursRestants: Math.ceil(
      (new Date(c.prochaineEcheance).getTime() - now.getTime()) / MS_DAY
    ),
  }));
}

export function monthlyEquivalent(montantCentimes: number, frequence: ChargeFrequence) {
  switch (frequence) {
    case "HEBDOMADAIRE":
      return Math.round(montantCentimes * 4.33);
    case "MENSUELLE":
      return montantCentimes;
    case "TRIMESTRIELLE":
      return Math.round(montantCentimes / 3);
    case "SEMESTRIELLE":
      return Math.round(montantCentimes / 6);
    case "ANNUELLE":
      return Math.round(montantCentimes / 12);
  }
}
