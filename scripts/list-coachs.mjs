import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const coachs = await prisma.coach.findMany({
  select: { id: true, prenom: true, nom: true },
  orderBy: { ordre: "asc" },
});
console.log(JSON.stringify(coachs, null, 2));
await prisma.$disconnect();
