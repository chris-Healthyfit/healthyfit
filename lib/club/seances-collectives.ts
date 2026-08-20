import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/club/presences";
import { seanceEstDuJour, seanceSansJour } from "@/lib/club/seance-jour";

export type SeanceClubStats = {
  presences: number;
  recetteCentimes: number;
  beneficeCentimes: number;
};

export type SeanceCatalogJour = {
  seanceId: number;
  horaire: string;
  titre: string;
  niveau: string;
  seanceClubId: number | null;
  coach: { id: number; prenom: string; nom: string } | null;
  stats: SeanceClubStats;
};

type SeanceClubRow = {
  id: number;
  date: Date;
  horaire: string;
  label: string | null;
  coachId: number;
  coachPrenom: string;
  coachNom: string;
};

function normalizeHoraire(h: string) {
  return h.replace(/[hH]/g, ":").replace(/\s/g, "").toLowerCase();
}

/** Lecture SeanceClub sans dépendre du client Prisma régénéré (évite colonne fantôme). */
async function fetchSeanceClubsForDay(
  dayStart: Date,
  coachFilterId: number | null | undefined
) {
  const rows = coachFilterId
    ? await prisma.$queryRaw<SeanceClubRow[]>`
        SELECT sc.id, sc.date, sc.horaire, sc.label, sc."coachId",
               c.prenom AS "coachPrenom", c.nom AS "coachNom"
        FROM "SeanceClub" sc
        JOIN "Coach" c ON c.id = sc."coachId"
        WHERE sc.date = ${dayStart} AND sc."coachId" = ${coachFilterId}
      `
    : await prisma.$queryRaw<SeanceClubRow[]>`
        SELECT sc.id, sc.date, sc.horaire, sc.label, sc."coachId",
               c.prenom AS "coachPrenom", c.nom AS "coachNom"
        FROM "SeanceClub" sc
        JOIN "Coach" c ON c.id = sc."coachId"
        WHERE sc.date = ${dayStart}
      `;

  return rows;
}

export async function getSeanceClubStats(
  seanceClubId: number
): Promise<SeanceClubStats> {
  const agg = await prisma.presence.aggregate({
    where: { seanceClubId },
    _count: true,
    _sum: { montantCentimes: true, beneficeCentimes: true },
  });
  return {
    presences: agg._count,
    recetteCentimes: agg._sum.montantCentimes ?? 0,
    beneficeCentimes: agg._sum.beneficeCentimes ?? 0,
  };
}

export function formatSeanceLabel(
  horaire: string,
  label: string | null,
  titre?: string | null
) {
  const name = titre || label;
  return name ? `${horaire} — ${name}` : horaire;
}

export async function findOrCreateSeanceClub(
  date: Date,
  seanceId: number,
  coachId: number
) {
  const catalog = await prisma.seance.findUnique({ where: { id: seanceId } });
  if (!catalog) throw new Error("Séance catalogue introuvable");

  const dayStart = startOfDay(date);
  const horaire = catalog.horaire.trim();

  const existing = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM "SeanceClub"
    WHERE date = ${dayStart} AND horaire = ${horaire}
    LIMIT 1
  `;
  if (existing[0]) {
    return { id: existing[0].id, date: dayStart, horaire, label: catalog.titre, coachId };
  }

  const created = await prisma.$queryRaw<{ id: number }[]>`
    INSERT INTO "SeanceClub" (date, horaire, label, "coachId", "createdAt")
    VALUES (${dayStart}, ${horaire}, ${catalog.titre}, ${coachId}, NOW())
    RETURNING id
  `;

  return {
    id: created[0].id,
    date: dayStart,
    horaire,
    label: catalog.titre,
    coachId,
  };
}

/** Séances enregistrées (Admin → Séances) filtrées par jour de la semaine. */
export async function listCatalogSeancesForDay(
  day: Date,
  coachFilterId: number | null | undefined,
  options?: { all?: boolean }
): Promise<SeanceCatalogJour[]> {
  const allCatalog = await prisma.seance.findMany({
    orderBy: [{ horaire: "asc" }, { titre: "asc" }],
  });

  const catalog = options?.all
    ? allCatalog
    : allCatalog.filter(
        (s) => seanceEstDuJour(s.horaire, day) || seanceSansJour(s.horaire)
      );

  const dayStart = startOfDay(day);
  const opened = await fetchSeanceClubsForDay(dayStart, coachFilterId);

  const openedByHoraire = new Map(
    opened.map((o) => [normalizeHoraire(o.horaire), o])
  );

  return Promise.all(
    catalog.map(async (s) => {
      const club = openedByHoraire.get(normalizeHoraire(s.horaire));
      const stats = club
        ? await getSeanceClubStats(club.id)
        : { presences: 0, recetteCentimes: 0, beneficeCentimes: 0 };

      return {
        seanceId: s.id,
        horaire: s.horaire,
        titre: s.titre,
        niveau: s.niveau,
        seanceClubId: club?.id ?? null,
        coach: club
          ? { id: club.coachId, prenom: club.coachPrenom, nom: club.coachNom }
          : null,
        stats,
      };
    })
  );
}

export async function listSeancesClub(
  day: Date,
  coachFilterId: number | null | undefined
) {
  const dayStart = startOfDay(day);
  const opened = await fetchSeanceClubsForDay(dayStart, coachFilterId);

  const withStats = await Promise.all(
    opened.map(async (s) => ({
      id: s.id,
      date: s.date,
      horaire: s.horaire,
      label: s.label,
      coachId: s.coachId,
      coach: { id: s.coachId, prenom: s.coachPrenom, nom: s.coachNom },
      stats: await getSeanceClubStats(s.id),
    }))
  );

  return withStats;
}
