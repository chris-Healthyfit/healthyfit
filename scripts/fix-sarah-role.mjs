import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sarah = await prisma.admin.findUnique({ where: { identifiant: "sarah" } });
if (sarah && sarah.role !== "SUPER_ADMIN") {
  await prisma.admin.update({
    where: { id: sarah.id },
    data: { role: "SUPER_ADMIN" },
  });
  console.log("Sarah promue SUPER_ADMIN");
} else if (sarah) {
  console.log("Sarah est déjà SUPER_ADMIN");
} else {
  console.log("Compte sarah introuvable");
}

await prisma.$disconnect();
