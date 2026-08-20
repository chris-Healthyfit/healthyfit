import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

async function coachIdFor(prenom: string) {
  const coach = await prisma.coach.findFirst({ where: { prenom } });
  return coach?.id ?? null;
}

export async function ensureSuperAdmins() {
  const passwordChris = process.env.ADMIN_PASSWORD;
  const passwordSarah = process.env.SARAH_PASSWORD ?? passwordChris;

  let chris = await prisma.admin.findUnique({
    where: { identifiant: "chris" },
  });

  if (!chris && passwordChris) {
    chris = await prisma.admin.create({
      data: {
        prenom: "Chris",
        nom: "Golard",
        identifiant: "chris",
        passwordHash: await hashPassword(passwordChris),
        role: "SUPER_ADMIN",
        coachId: await coachIdFor("Chris"),
      },
    });
  } else if (chris && chris.role !== "SUPER_ADMIN") {
    chris = await prisma.admin.update({
      where: { id: chris.id },
      data: { role: "SUPER_ADMIN" },
    });
  }

  let sarah = await prisma.admin.findUnique({
    where: { identifiant: "sarah" },
  });

  if (!sarah && passwordSarah) {
    sarah = await prisma.admin.create({
      data: {
        prenom: "Sarah",
        nom: "HealthyFit",
        identifiant: "sarah",
        passwordHash: await hashPassword(passwordSarah),
        role: "SUPER_ADMIN",
        coachId: await coachIdFor("Sarah"),
      },
    });
  } else if (sarah && sarah.role !== "SUPER_ADMIN") {
    sarah = await prisma.admin.update({
      where: { id: sarah.id },
      data: { role: "SUPER_ADMIN" },
    });
  }

  return { chris, sarah };
}

/** @deprecated Utiliser ensureSuperAdmins */
export async function ensureSuperAdmin() {
  const { chris } = await ensureSuperAdmins();
  return chris;
}
