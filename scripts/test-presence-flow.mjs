import { PrismaClient } from "@prisma/client";
import { createPresence } from "../lib/club/presences.js";
import { vendreCarte } from "../lib/club/cartes.js";

const prisma = new PrismaClient();

try {
  const member = await prisma.clubMember.findFirst({ where: { actif: true, id: 4 } });
  const seanceClub = await prisma.seanceClub.findFirst({ orderBy: { id: "desc" } });
  const admin = await prisma.admin.findFirst();
  if (!member || !seanceClub || !admin) throw new Error("missing data");

  console.log("Test vendreCarte...");
  const carte = await vendreCarte({ memberId: member.id, estVip: false, enregistreParId: admin.id });
  console.log("Carte vendue", carte.carte.id, carte.carte.seancesRestantes);

  console.log("Test createPresence CARTE_10 auto...");
  const presence = await createPresence({
    memberId: member.id,
    coachId: seanceClub.coachId,
    seanceClubId: seanceClub.id,
    enregistreParId: admin.id,
  });
  console.log("Presence OK", presence.id, presence.mode, presence.montantCentimes);

  await prisma.presence.delete({ where: { id: presence.id } });
  await prisma.carteClub.deleteMany({ where: { memberId: member.id } });
  await prisma.clubMember.update({
    where: { id: member.id },
    data: { abonnementType: "SEANCE", seancesCarteRestantes: null },
  });
  console.log("Cleaned up");
} catch (e) {
  console.error("ERROR:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
