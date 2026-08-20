import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const admins = await prisma.admin.findMany({
  select: {
    id: true,
    identifiant: true,
    role: true,
    actif: true,
    coachId: true,
    prenom: true,
    nom: true,
  },
  orderBy: { id: "asc" },
});
console.log(JSON.stringify(admins, null, 2));
await prisma.$disconnect();
