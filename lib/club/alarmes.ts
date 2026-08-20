import { prisma } from "@/lib/prisma";
import { needsBilanReminder } from "@/lib/club/bilans";

const JOURS_RELANCE = 14;

export type AlarmeMembre = {
  id: number;
  prenom: string;
  nom: string | null;
  coachReferent?: { prenom: string; nom: string };
};

export type ClubAlarmes = {
  bilans: { count: number; membres: AlarmeMembre[] };
  relances: { count: number; membres: AlarmeMembre[] };
  stock: { count: number };
  total: number;
};

export async function getClubAlarmes(
  coachFilterId: number | null | undefined,
  includeStock = false
): Promise<ClubAlarmes> {
  const where =
    coachFilterId != null
      ? { coachReferentId: coachFilterId, actif: true }
      : { actif: true };

  const membres = await prisma.clubMember.findMany({
    where,
    include: {
      coachReferent: { select: { prenom: true, nom: true } },
      bilans: { orderBy: { date: "desc" }, take: 1 },
      presences: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { prenom: "asc" },
  });

  const bilans: AlarmeMembre[] = [];
  const relances: AlarmeMembre[] = [];

  for (const m of membres) {
    const lastBilan = m.bilans[0]?.date ?? null;
    if (needsBilanReminder(lastBilan)) {
      bilans.push({
        id: m.id,
        prenom: m.prenom,
        nom: m.nom,
        coachReferent: m.coachReferent,
      });
    }

    const lastPresence = m.presences[0]?.date;
    const joursSans =
      lastPresence == null
        ? 999
        : Math.floor(
            (Date.now() - new Date(lastPresence).getTime()) / 86400000
          );
    if (joursSans >= JOURS_RELANCE) {
      relances.push({
        id: m.id,
        prenom: m.prenom,
        nom: m.nom,
        coachReferent: m.coachReferent,
      });
    }
  }

  let stockCount = 0;
  if (includeStock) {
    const items = await prisma.stockItem.findMany();
    stockCount = items.filter((i) => i.quantite <= i.seuilAlerte).length;
  }

  return {
    bilans: { count: bilans.length, membres: bilans },
    relances: { count: relances.length, membres: relances },
    stock: { count: stockCount },
    total: bilans.length + relances.length + stockCount,
  };
}

export function getAlarmeMemberIds(
  alarmes: ClubAlarmes,
  type: "bilan" | "relance" | "stock"
): number[] {
  if (type === "bilan") return alarmes.bilans.membres.map((m) => m.id);
  if (type === "relance") return alarmes.relances.membres.map((m) => m.id);
  return [];
}
