/**
 * Supprime les données de DÉMO (seed) : clients fictifs, présences, bilans, cartes.
 * Garde : coachs, séances admin, galerie, contact, comptes admin, tarifs, stock.
 *
 * Usage : npm run db:clear-demo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = {
    members: await prisma.clubMember.count(),
    presences: await prisma.presence.count(),
    bilans: await prisma.bilan.count(),
    cartes: await prisma.carteClub.count(),
    entries: await prisma.accountingEntry.count(),
    seancesClub: await prisma.seanceClub.count(),
  };

  console.log("Avant suppression démo :", before);

  await prisma.$transaction([
    prisma.accountingEntry.deleteMany({}),
    prisma.stockMovement.deleteMany({}),
    prisma.stockPurchaseLine.deleteMany({}),
    prisma.stockPurchase.deleteMany({}),
    prisma.vente.deleteMany({}),
    prisma.seanceClub.deleteMany({}),
    prisma.clubMember.deleteMany({}),
  ]);

  const after = {
    members: await prisma.clubMember.count(),
    presences: await prisma.presence.count(),
    seances: await prisma.seance.count(),
    coaches: await prisma.coach.count(),
    galerie: await prisma.galerie.count(),
  };

  console.log("\n✅ Démo supprimée.");
  console.log("Conservé :", after);
  console.log(
    "\nProchaine étape : npm run db:restore-backup puis resaisir vos vrais clients."
  );
}

main()
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
