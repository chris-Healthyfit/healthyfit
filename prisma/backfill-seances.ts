import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function normalizeHoraire(h: string) {
  return h.replace(/[hH]/g, ":").replace(/\s/g, "").toLowerCase();
}

async function getCatalogSeances() {
  return prisma.seance.findMany({ orderBy: { id: "asc" } });
}

export async function backfillSeanceClub() {
  const catalog = await getCatalogSeances();
  if (catalog.length === 0) {
    console.log("⚠️ Aucune séance dans Admin → Séances. Rien à rattacher.");
    return;
  }

  const sans = await prisma.presence.findMany({
    where: { seanceClubId: null },
    include: { member: { select: { coachReferentId: true } } },
  });

  if (sans.length === 0) {
    console.log("✅ Toutes les présences ont une séance.");
    return;
  }

  console.log(`🔗 Rattachement de ${sans.length} présences…`);

  for (const p of sans) {
    const match = catalog[p.id % catalog.length];
    const day = startOfDay(p.date);
    const coachId = p.coachId || p.member.coachReferentId;
    const horaire = match.horaire.trim();

    let seance = await prisma.seanceClub.findUnique({
      where: { date_horaire: { date: day, horaire } },
    });
    if (!seance) {
      seance = await prisma.seanceClub.create({
        data: {
          date: day,
          horaire,
          label: match.titre,
          coachId,
        },
      });
    }

    await prisma.presence.update({
      where: { id: p.id },
      data: { seanceClubId: seance.id },
    });
  }

  console.log("✅ Backfill séances terminé.");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  backfillSeanceClub()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
