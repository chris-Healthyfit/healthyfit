import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

try {
  const admins = await p.admin.findMany({
    select: {
      id: true,
      identifiant: true,
      role: true,
      coachId: true,
      actif: true,
      prenom: true,
      nom: true,
    },
    orderBy: { id: "asc" },
  });
  const coachs = await p.coach.findMany({
    select: { id: true, prenom: true, nom: true },
    orderBy: { id: "asc" },
  });

  console.log("ADMINS:", JSON.stringify(admins, null, 2));
  console.log("COACHS:", JSON.stringify(coachs, null, 2));

  for (const c of coachs) {
    const linked = admins.filter((a) => a.coachId === c.id);
    const orphan = admins.filter(
      (a) =>
        a.role === "COACH" &&
        a.prenom.toLowerCase().startsWith(c.prenom.toLowerCase().slice(0, 3))
    );
    console.log(
      `Coach ${c.id} ${c.prenom}: linked=${linked.length}`,
      linked.length ? linked : orphan.length ? `(orphan match: ${orphan.map((a) => a.identifiant).join(",")})` : ""
    );
  }
} finally {
  await p.$disconnect();
}
