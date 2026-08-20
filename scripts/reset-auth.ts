import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  const pwdChris = process.env.ADMIN_PASSWORD;
  const pwdSarah = process.env.SARAH_PASSWORD ?? pwdChris;
  const pwdCoach = process.env.COACH_PASSWORD ?? pwdChris ?? "healthyfit";

  if (!pwdChris) {
    console.error("❌ ADMIN_PASSWORD manquant dans .env");
    process.exit(1);
  }

  for (const [identifiant, password] of [
    ["chris", pwdChris],
    ["sarah", pwdSarah!],
    ["amandine", pwdCoach],
    ["ophelie", pwdCoach],
  ] as const) {
    const admin = await prisma.admin.findUnique({ where: { identifiant } });
    if (!admin) {
      console.log(`⚠️ Compte ${identifiant} introuvable`);
      continue;
    }
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: await hashPassword(password),
        actif: true,
        role: identifiant === "chris" || identifiant === "sarah" ? "SUPER_ADMIN" : "COACH",
      },
    });
    console.log(`✅ ${identifiant} — mot de passe réinitialisé`);
  }

  console.log("\nConnexion :");
  console.log("  Admin → /portail (5 clics logo)");
  console.log("  Club  → /portail-club (5 clics « Le Club »)");
  console.log("  Chris/Sarah : mot de passe = ADMIN_PASSWORD du .env");
  console.log("  Coachs      : même mot de passe (ou COACH_PASSWORD si défini)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
