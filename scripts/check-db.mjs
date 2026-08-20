import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const [members, presences, bilans, tarifs, coachs, admins] = await Promise.all([
    prisma.clubMember.count(),
    prisma.presence.count(),
    prisma.bilan.count(),
    prisma.clubTarif.count(),
    prisma.coach.count(),
    prisma.admin.count(),
  ]);

  console.log(JSON.stringify({ members, presences, bilans, tarifs, coachs, admins }, null, 2));

  const ok =
    members >= 30 &&
    presences > 0 &&
    bilans > 0 &&
    tarifs >= 3 &&
    coachs >= 4 &&
    admins >= 4;

  console.log(ok ? "STATUS: OK" : "STATUS: INCOMPLETE — run npm run db:seed");
} catch (e) {
  console.error("DB_ERROR:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
