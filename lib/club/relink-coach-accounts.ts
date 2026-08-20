import { prisma } from "@/lib/prisma";

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Rattache les comptes coach orphelins (coachId null) aux fiches Coach actuelles. */
export async function relinkOrphanCoachAccounts() {
  const [admins, coachs] = await Promise.all([
    prisma.admin.findMany({
      where: { role: "COACH", coachId: null },
    }),
    prisma.coach.findMany(),
  ]);

  const results: { identifiant: string; coachId: number | null; status: string }[] =
    [];

  for (const admin of admins) {
    const match = coachs.find(
      (c) =>
        norm(c.prenom) === norm(admin.prenom) ||
        norm(c.prenom).startsWith(norm(admin.prenom).slice(0, 4))
    );

    if (!match) {
      results.push({
        identifiant: admin.identifiant,
        coachId: null,
        status: "aucun coach correspondant",
      });
      continue;
    }

    const taken = await prisma.admin.findUnique({
      where: { coachId: match.id },
    });
    if (taken && taken.id !== admin.id) {
      results.push({
        identifiant: admin.identifiant,
        coachId: match.id,
        status: `coach ${match.prenom} déjà lié à ${taken.identifiant}`,
      });
      continue;
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        coachId: match.id,
        prenom: match.prenom,
        nom: match.nom,
      },
    });

    results.push({
      identifiant: admin.identifiant,
      coachId: match.id,
      status: `rattaché à ${match.prenom} ${match.nom}`,
    });
  }

  // Sarah direction → fiche coach Sarah si orpheline
  const sarahAdmin = await prisma.admin.findUnique({
    where: { identifiant: "sarah" },
  });
  const sarahCoach = coachs.find((c) => norm(c.prenom) === "sarah");
  if (
    sarahAdmin &&
    sarahAdmin.coachId == null &&
    sarahCoach &&
    !(await prisma.admin.findUnique({ where: { coachId: sarahCoach.id } }))
  ) {
    await prisma.admin.update({
      where: { id: sarahAdmin.id },
      data: { coachId: sarahCoach.id },
    });
    results.push({
      identifiant: "sarah",
      coachId: sarahCoach.id,
      status: "rattaché (direction)",
    });
  }

  return results;
}
