import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

try {
  const [seances, coaches, galerie, temoignages, club, nutrition, contacts] =
    await Promise.all([
      p.seance.findMany({ select: { horaire: true, titre: true } }),
      p.coach.findMany({
        select: { id: true, prenom: true, nom: true, image: true, description: true },
      }),
      p.galerie.count(),
      p.temoignage.count(),
      p.club.findFirst({ select: { titre: true } }),
      p.nutrition.findFirst({ select: { titre: true } }),
      p.contact.count(),
    ]);

  console.log("SEANCES:", seances.length, seances);
  console.log("COACHS:", coaches);
  console.log("GALERIE:", galerie, "TEMOIGNAGES:", temoignages);
  console.log("CLUB:", club?.titre, "NUTRITION:", nutrition?.titre, "CONTACTS:", contacts);

  const members = await p.clubMember.findMany({
    take: 8,
    select: { prenom: true, nom: true, coachReferent: { select: { prenom: true } } },
    orderBy: { id: "asc" },
  });
  const memberCount = await p.clubMember.count();
  console.log("CLIENTS CLUB:", memberCount, members);
} finally {
  await p.$disconnect();
}
